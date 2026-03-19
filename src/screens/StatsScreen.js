import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator, Animated,
} from 'react-native'
import Svg, { G, Polyline, Circle, Line as SvgLine, Text as SvgText } from 'react-native-svg'
import { supabase } from '../lib/supabase'
import { useProfileId } from '../hooks/useProfileId'
import { useTheme } from '../lib/theme'

// ── Data helpers ─────────────────────────────────────────────────────────────

function parseWorkouts(history) {
  return history.map(h => {
    let parsed = null
    try { if (h.notes) parsed = JSON.parse(h.notes) } catch (_) {}
    return { ...h, parsed }
  }).filter(h => !h.parsed?.is_warmup)
}

function computeStreaks(workouts) {
  if (!workouts.length) return { current: 0, best: 0 }
  const dateSet = new Set(workouts.map(w => w.completed_at.split('T')[0]))
  const sorted = [...dateSet].sort()

  let best = 1, run = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000)
    if (diff === 1) { run++; if (run > best) best = run }
    else run = 1
  }

  let current = 0
  const check = new Date()
  check.setHours(0, 0, 0, 0)
  while (true) {
    const ds = check.toISOString().split('T')[0]
    if (dateSet.has(ds)) { current++; check.setDate(check.getDate() - 1) }
    else break
  }

  return { current, best }
}

function computeWeekly(workouts, numWeeks) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const daysToMon = now.getDay() === 0 ? 6 : now.getDay() - 1
  const currentWeekStart = new Date(now)
  currentWeekStart.setDate(now.getDate() - daysToMon)

  const weeks = []
  for (let i = numWeeks - 1; i >= 0; i--) {
    const start = new Date(currentWeekStart)
    start.setDate(currentWeekStart.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    const count = workouts.filter(w => {
      const d = new Date(w.completed_at)
      return d >= start && d < end
    }).length
    weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count })
  }
  return weeks
}

// Derives exercises from history — auto-includes future workouts
function extractWeightExercises(workouts) {
  const freq = {}
  for (const w of workouts) {
    for (const ex of (w.parsed?.exercises ?? [])) {
      if (!ex.type && ex.kg > 0 && ex.done > 0) {
        freq[ex.name] = (freq[ex.name] ?? 0) + 1
      }
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([name]) => name)
}

function computeProgress(workouts, exerciseName) {
  const points = []
  for (const w of workouts) {
    const ex = (w.parsed?.exercises ?? []).find(e => e.name === exerciseName && e.kg > 0 && e.done > 0)
    if (ex) {
      const d = new Date(w.completed_at)
      points.push({
        label:  `${d.getMonth() + 1}/${d.getDate()}`,
        kg:     ex.kg,
        reps:   ex.reps,
        sets:   ex.done,
        volume: ex.done * ex.reps * ex.kg,
      })
    }
  }
  return points
}

function computeVolume(workouts, limit) {
  const result = []
  for (const w of [...workouts].reverse()) {
    const exercises = w.parsed?.exercises ?? []
    let vol = 0
    for (const ex of exercises) {
      if (!ex.type && ex.done > 0 && ex.kg > 0) vol += ex.done * ex.reps * ex.kg
    }
    if (vol > 0) {
      const d = new Date(w.completed_at)
      result.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: vol })
      if (result.length >= limit) break
    }
  }
  return result.reverse()
}

function fmtVol(v) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`
}

const METRICS = [
  { key: 'kg',     label: 'kg',     unit: 'kg' },
  { key: 'reps',   label: 'reps',   unit: '' },
  { key: 'volume', label: 'volume', unit: '' },
]

// ── Chart components ─────────────────────────────────────────────────────────

function BarChart({ data, valueKey, C, styles: S, fmt }) {
  const maxVal = Math.max(...data.map(d => d[valueKey] ?? 0), 1)
  const fmtFn = fmt ?? (v => `${v}`)
  return (
    <View style={S.barChart}>
      {data.map((d, i) => {
        const val = d[valueKey] ?? 0
        const barH = val > 0 ? Math.max((val / maxVal) * 96, 6) : 0
        return (
          <View key={i} style={S.barCol}>
            {val > 0 && <Text style={S.barValue}>{fmtFn(val)}</Text>}
            <View style={[S.bar, { height: barH }]} />
            <Text style={S.barLabel}>{d.label}</Text>
          </View>
        )
      })}
    </View>
  )
}

function LineChart({ data, valueKey, C }) {
  const [w, setW] = useState(0)
  const H = 160
  const PAD = { top: 20, right: 20, bottom: 28, left: 48 }
  const innerW = Math.max(w - PAD.left - PAD.right, 0)
  const innerH = H - PAD.top - PAD.bottom

  const values = data.map(d => d[valueKey])
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1

  const pts = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2),
    y: PAD.top + innerH - ((d[valueKey] - minV) / range) * innerH,
    ...d,
  }))

  const polyPts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const xIdxs = data.length <= 5
    ? data.map((_, i) => i)
    : [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(3 * data.length / 4), data.length - 1]

  const mid = Math.round((minV + maxV) / 2)
  const yTicks = [minV, mid, maxV].filter((v, i, a) => a.indexOf(v) === i)

  const fmtY = valueKey === 'volume' ? fmtVol : (v => `${v}`)

  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Svg width={w} height={H}>
          <SvgLine x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke={C.border} strokeWidth={1} />
          <SvgLine x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke={C.border} strokeWidth={1} />

          {yTicks.map((v, i) => {
            const y = PAD.top + innerH - ((v - minV) / range) * innerH
            return (
              <G key={i}>
                <SvgLine x1={PAD.left - 4} y1={y} x2={PAD.left} y2={y} stroke={C.border} strokeWidth={1} />
                <SvgText x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill={C.subtext}>{fmtY(v)}</SvgText>
              </G>
            )
          })}

          {pts.length > 1 && (
            <Polyline points={polyPts} stroke={C.text} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {pts.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={C.primary} stroke={C.bg} strokeWidth={2} />
          ))}

          {xIdxs.map(i => (
            <SvgText key={i} x={pts[i].x} y={PAD.top + innerH + 16} textAnchor="middle" fontSize={10} fill={C.subtext}>
              {data[i].label}
            </SvgText>
          ))}
        </Svg>
      )}
    </View>
  )
}

function SessionLog({ data, C, styles: S }) {
  return (
    <View style={S.sessionLog}>
      <View style={S.sessionHeader}>
        <Text style={S.sessionHeaderCell}>Date</Text>
        <Text style={S.sessionHeaderCell}>Sets</Text>
        <Text style={S.sessionHeaderCell}>Reps</Text>
        <Text style={S.sessionHeaderCell}>kg</Text>
        <Text style={[S.sessionHeaderCell, S.sessionHeaderRight]}>Volume</Text>
      </View>
      {[...data].reverse().map((d, i) => (
        <View key={i} style={[S.sessionRow, i > 0 && S.sessionRowBorder]}>
          <Text style={S.sessionCell}>{d.label}</Text>
          <Text style={S.sessionCell}>{d.sets}</Text>
          <Text style={S.sessionCell}>{d.reps}</Text>
          <Text style={S.sessionCell}>{d.kg}</Text>
          <Text style={[S.sessionCell, S.sessionCellRight]}>{fmtVol(d.volume)}</Text>
        </View>
      ))}
    </View>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function StatsScreen({ route, navigation }) {
  const { profileName, plan } = route.params
  const profileId = useProfileId(profileName)
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: 60, useNativeDriver: true }).start()
  }, [])

  const [rawHistory, setRawHistory] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedEx, setSelectedEx] = useState(null)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [metric, setMetric]         = useState('kg')

  useEffect(() => {
    if (!profileId) return
    supabase
      .from('workout_history')
      .select('id, workout_key, completed_at, notes')
      .eq('profile_id', profileId)
      .order('completed_at', { ascending: true })
      .then(({ data }) => { setRawHistory(data ?? []); setLoading(false) })
  }, [profileId])

  const workouts = useMemo(() => parseWorkouts(rawHistory), [rawHistory])

  const today = new Date()
  const thisMonth = workouts.filter(w => {
    const d = new Date(w.completed_at)
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }).length

  const { current: currentStreak, best: bestStreak } = useMemo(() => computeStreaks(workouts), [workouts])
  const weeklyData   = useMemo(() => computeWeekly(workouts, 8), [workouts])
  const exerciseList = useMemo(() => extractWeightExercises(workouts), [workouts])
  const volumeData   = useMemo(() => computeVolume(workouts, 10), [workouts])

  useEffect(() => {
    if (exerciseList.length && !selectedEx) setSelectedEx(exerciseList[0])
  }, [exerciseList])

  const progressData = useMemo(() => (
    selectedEx ? computeProgress(workouts, selectedEx) : []
  ), [workouts, selectedEx])

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>Back</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 80 }} color={C.text} />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>

            {/* ── Summary cards ── */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{workouts.length}</Text>
                <Text style={styles.summaryLabel}>Total Workouts</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{thisMonth}</Text>
                <Text style={styles.summaryLabel}>This Month</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{currentStreak}<Text style={styles.summaryUnit}>d</Text></Text>
                <Text style={styles.summaryLabel}>Current Streak</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{bestStreak}<Text style={styles.summaryUnit}>d</Text></Text>
                <Text style={styles.summaryLabel}>Best Streak</Text>
              </View>
            </View>

            {/* ── Weekly Activity ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Activity</Text>
              <Text style={styles.sectionSub}>Workouts per week · last 8 weeks</Text>
              <View style={styles.chartCard}>
                <BarChart data={weeklyData} valueKey="count" C={C} styles={styles} />
              </View>
            </View>

            {/* ── Exercise Progress ── */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View>
                  <Text style={styles.sectionTitle}>Exercise Progress</Text>
                  <Text style={styles.sectionSub}>Tap an exercise to view its history</Text>
                </View>
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[styles.modeBtn, !advancedMode && styles.modeBtnActive]}
                    onPress={() => setAdvancedMode(false)}
                  >
                    <Text style={[styles.modeBtnText, !advancedMode && styles.modeBtnTextActive]}>Simple</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeBtn, advancedMode && styles.modeBtnActive]}
                    onPress={() => setAdvancedMode(true)}
                  >
                    <Text style={[styles.modeBtnText, advancedMode && styles.modeBtnTextActive]}>Advanced</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {exerciseList.length === 0 ? (
                <View style={styles.chartCard}>
                  <Text style={styles.emptyText}>Complete some workouts to see progress charts</Text>
                </View>
              ) : (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
                    {exerciseList.map(name => (
                      <TouchableOpacity
                        key={name}
                        style={[styles.chip, selectedEx === name && styles.chipActive]}
                        onPress={() => setSelectedEx(name)}
                      >
                        <Text style={[styles.chipText, selectedEx === name && styles.chipTextActive]}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {progressData.length === 0 ? (
                    <View style={styles.chartCard}>
                      <Text style={styles.emptyText}>No data for this exercise yet</Text>
                    </View>
                  ) : (
                    <View style={styles.chartCard}>
                      {/* Metric selector — advanced only */}
                      {advancedMode && (
                        <View style={styles.metricRow}>
                          {METRICS.map(m => (
                            <TouchableOpacity
                              key={m.key}
                              style={[styles.metricBtn, metric === m.key && styles.metricBtnActive]}
                              onPress={() => setMetric(m.key)}
                            >
                              <Text style={[styles.metricBtnText, metric === m.key && styles.metricBtnTextActive]}>{m.label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      <LineChart data={progressData} valueKey={advancedMode ? metric : 'kg'} C={C} />

                      {/* Session log — advanced only */}
                      {advancedMode && <SessionLog data={progressData} C={C} styles={styles} />}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* ── Volume per session ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Training Volume</Text>
              <Text style={styles.sectionSub}>Total weight lifted per session · last 10</Text>
              {volumeData.length === 0 ? (
                <View style={styles.chartCard}>
                  <Text style={styles.emptyText}>No volume data yet</Text>
                </View>
              ) : (
                <View style={styles.chartCard}>
                  <BarChart data={volumeData} valueKey="value" C={C} styles={styles} fmt={fmtVol} />
                </View>
              )}
            </View>

          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
    backBtn:     { fontSize: 15, color: C.subtext },

    scroll: { paddingHorizontal: 24, paddingBottom: 56, paddingTop: 28, gap: 36 },

    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    summaryCard: {
      backgroundColor: C.card, borderRadius: 16, padding: 20,
      alignItems: 'center', flexBasis: '47%', flexGrow: 1,
    },
    summaryValue: { fontSize: 36, fontWeight: '800', color: C.text, letterSpacing: -1 },
    summaryUnit:  { fontSize: 20, fontWeight: '600', color: C.subtext },
    summaryLabel: { fontSize: 12, color: C.subtext, marginTop: 4, fontWeight: '500', textAlign: 'center' },

    section:         { gap: 10 },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    sectionTitle:    { fontSize: 18, fontWeight: '700', color: C.text },
    sectionSub:      { fontSize: 13, color: C.subtext, marginTop: 2 },
    chartCard:       { backgroundColor: C.card, borderRadius: 16, padding: 16, gap: 12 },
    emptyText:       { fontSize: 14, color: C.muted, textAlign: 'center', paddingVertical: 28, fontStyle: 'italic' },

    barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 128, gap: 3 },
    barCol:   { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 128 },
    bar:      { width: '85%', backgroundColor: C.text, borderRadius: 4, opacity: 0.85 },
    barValue: { fontSize: 9, color: C.subtext, marginBottom: 3 },
    barLabel: { fontSize: 9, color: C.muted, marginTop: 5, textAlign: 'center' },

    chipRow:        { flexGrow: 0 },
    chipRowContent: { gap: 8, paddingBottom: 2 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 8,
      backgroundColor: C.card, borderRadius: 20,
      borderWidth: 1, borderColor: C.border,
    },
    chipActive:     { backgroundColor: C.primary, borderColor: C.primary },
    chipText:       { fontSize: 13, fontWeight: '600', color: C.subtext },
    chipTextActive: { color: C.primaryText },

    // Mode toggle (Simple / Advanced)
    modeToggle: {
      flexDirection: 'row', backgroundColor: C.card,
      borderRadius: 10, padding: 3, gap: 2,
    },
    modeBtn:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    modeBtnActive:    { backgroundColor: C.primary },
    modeBtnText:      { fontSize: 12, fontWeight: '600', color: C.subtext },
    modeBtnTextActive:{ color: C.primaryText },

    // Metric selector (kg / reps / volume)
    metricRow:         { flexDirection: 'row', gap: 8 },
    metricBtn:         { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: C.secondary },
    metricBtnActive:   { backgroundColor: C.primary },
    metricBtnText:     { fontSize: 13, fontWeight: '600', color: C.subtext },
    metricBtnTextActive: { color: C.primaryText },

    // Session log table
    sessionLog: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, gap: 0 },
    sessionHeader: {
      flexDirection: 'row', paddingBottom: 6,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    sessionHeaderCell:  { flex: 1, fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
    sessionHeaderRight: { textAlign: 'right' },
    sessionRow:         { flexDirection: 'row', paddingVertical: 7 },
    sessionRowBorder:   { borderTopWidth: 1, borderTopColor: C.divider },
    sessionCell:        { flex: 1, fontSize: 13, color: C.text, fontWeight: '500' },
    sessionCellRight:   { textAlign: 'right' },
  })
}
