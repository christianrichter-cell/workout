import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ScrollView, ActivityIndicator, Animated,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useProfileId } from '../hooks/useProfileId'
import { useTheme } from '../lib/theme'
import { findWorkoutByKey, findWarmupByKey, CHRIS_NEW_PLAN, CHRIS_OLD_PLAN, KATA_WORKOUT_DAYS } from '../data/workoutsData'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const ALL_WORKOUTS = [
  ...CHRIS_NEW_PLAN.map(w  => ({ ...w, group: 'New Plan' })),
  ...CHRIS_OLD_PLAN.map(w  => ({ ...w, group: 'Old Plan' })),
  ...KATA_WORKOUT_DAYS.map(w => ({ ...w, group: 'Káťa' })),
]

function buildCalendarDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let firstDay = new Date(year, month, 1).getDay()
  firstDay = firstDay === 0 ? 6 : firstDay - 1
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function HistoryScreen({ route, navigation }) {
  const { profileName, plan, showStartWorkout } = route.params
  const profileId = useProfileId(profileName)
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])

  const today = new Date()
  const [year, setYear]         = useState(today.getFullYear())
  const [month, setMonth]       = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [editingId, setEditingId]     = useState(null)
  const [editKey, setEditKey]         = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [expandedId, setExpandedId]   = useState(null)
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: 60, useNativeDriver: true }).start()
  }, [])

  useEffect(() => {
    if (!profileId) return
    supabase
      .from('workout_history')
      .select('id, workout_key, completed_at, notes')
      .eq('profile_id', profileId)
      .order('completed_at', { ascending: false })
      .then(({ data }) => { setHistory(data ?? []); setLoading(false) })
  }, [profileId])

  const byDate = history.reduce((acc, row) => {
    const d = row.completed_at.split('T')[0]
    if (!acc[d]) acc[d] = []
    acc[d].push(row)
    return acc
  }, {})

  const prevMonth = () => {
    setSelectedDay(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedDay(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleDeletePress = (entry) => {
    if (confirmDeleteId === entry.id) {
      supabase.from('workout_history').delete().eq('id', entry.id).then(() => {
        setHistory((prev) => prev.filter((r) => r.id !== entry.id))
        setConfirmDeleteId(null)
        setEditingId(null)
      })
    } else {
      setConfirmDeleteId(entry.id)
      setEditingId(null)
    }
  }

  const cancelDelete = () => setConfirmDeleteId(null)

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setEditKey(entry.workout_key)
  }

  const saveEdit = async () => {
    if (!editKey || !editingId) return
    await supabase
      .from('workout_history')
      .update({ workout_key: editKey })
      .eq('id', editingId)
    setHistory((prev) =>
      prev.map((r) => r.id === editingId ? { ...r, workout_key: editKey } : r)
    )
    setEditingId(null)
    setEditKey(null)
  }

  const cancelEdit = () => { setEditingId(null); setEditKey(null) }

  const calendarDays = buildCalendarDays(year, month)
  const selectedDateStr = selectedDay ? toDateStr(year, month, selectedDay) : null
  const selectedEntries = selectedDateStr ? (byDate[selectedDateStr] ?? []) : []

  const isToday    = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  const hasWorkout = (day) => !!byDate[toDateStr(year, month, day)]

  const renderEntry = (entry, dateLabel) => {
    let parsed = null
    try { if (entry.notes) parsed = JSON.parse(entry.notes) } catch (_) {}
    const isWarmup = parsed?.is_warmup === true
    const w            = isWarmup ? findWarmupByKey(entry.workout_key) : findWorkoutByKey(entry.workout_key)
    const isEditing    = editingId === entry.id
    const isPendingDel = confirmDeleteId === entry.id
    const isExpanded   = expandedId === entry.id
    const timeStr      = dateLabel
      ?? new Date(entry.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const isIncomplete  = parsed?.incomplete === true
    const exerciseLog   = parsed?.exercises ?? null          // new format
    const legacySkipped = parsed?.skipped ?? []              // old format backwards compat
    const hasDetails    = !!exerciseLog

    const fmtKg = (kg) => kg > 0 ? `${kg} kg` : 'BW'

    return (
      <View key={entry.id} style={styles.entryCard}>
        <TouchableOpacity
          activeOpacity={hasDetails ? 0.7 : 1}
          onPress={() => hasDetails && setExpandedId(isExpanded ? null : entry.id)}
        >
          <View style={styles.entryRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.entryNameRow}>
                <Text style={styles.entryName}>{w?.name ?? entry.workout_key}</Text>
                {isWarmup && (
                  <Text style={styles.warmupBadge}>warm-up</Text>
                )}
                {!isWarmup && !isIncomplete && hasDetails && (
                  <Text style={styles.completeBadge}>complete</Text>
                )}
                {isIncomplete && (
                  <Text style={styles.incompleteBadge}>incomplete</Text>
                )}
              </View>
              {w?.subtitle ? <Text style={styles.entrySub}>{w.subtitle}</Text> : null}
              <Text style={styles.entryTime}>{timeStr}</Text>
              {hasDetails && (
                <Text style={styles.detailsHint}>{isExpanded ? 'Hide details ▲' : 'View details ▼'}</Text>
              )}
            </View>
            <View style={styles.entryActions}>
              {isPendingDel ? (
                <>
                  <TouchableOpacity style={styles.confirmDeleteBtn} onPress={() => handleDeletePress(entry)}>
                    <Text style={styles.confirmDeleteBtnText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editBtn} onPress={cancelDelete}>
                    <Text style={styles.editBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {!isWarmup && (
                    <TouchableOpacity style={styles.editBtn} onPress={() => isEditing ? cancelEdit() : startEdit(entry)}>
                      <Text style={styles.editBtnText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePress(entry)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* ── New format: exercise log ── */}
        {isExpanded && exerciseLog && (
          <View style={styles.exerciseLog}>
            {exerciseLog.map((ex, i) => {
              const skipped = ex.done === 0
              const partial = ex.done > 0 && ex.done < ex.sets
              let detail = ''
              if (!skipped) {
                if (ex.type === 'run' || ex.type === 'cycling') {
                  detail = `${ex.distKm} km · ${ex.timeMins} min${ex.pace ? ` · ${ex.pace}` : ''}`
                } else if (ex.type === 'plank') {
                  const m = Math.floor(ex.timeSec / 60)
                  const s = ex.timeSec % 60
                  const timeStr = m > 0 ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`
                  detail = `${partial ? `${ex.done}/${ex.sets}` : ex.done} × ${timeStr}`
                } else {
                  detail = `${partial ? `${ex.done}/${ex.sets}` : ex.done} × ${ex.reps} · ${fmtKg(ex.kg)}`
                }
              }
              return (
                <View key={i} style={[styles.exerciseRow, i > 0 && styles.exerciseRowBorder]}>
                  <Text style={styles.exerciseRowName} numberOfLines={1}>{ex.name}</Text>
                  {skipped ? (
                    <Text style={styles.exerciseRowSkipped}>skipped</Text>
                  ) : (
                    <Text style={[styles.exerciseRowDetail, partial && styles.exerciseRowPartial]}>
                      {detail}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* ── Legacy format: old skipped list ── */}
        {isExpanded && !exerciseLog && legacySkipped.length > 0 && (
          <View style={styles.exerciseLog}>
            <Text style={styles.skippedTitle}>Not completed:</Text>
            {legacySkipped.map((s, i) => (
              <Text key={i} style={styles.exerciseRowSkipped}>• {s}</Text>
            ))}
          </View>
        )}

        {isEditing && (
          <View style={styles.editPanel}>
            <Text style={styles.editPanelTitle}>Choose a different workout:</Text>
            <ScrollView style={styles.workoutPicker} nestedScrollEnabled>
              {ALL_WORKOUTS.map((w2) => (
                <TouchableOpacity
                  key={w2.key}
                  style={[styles.pickRow, editKey === w2.key && styles.pickRowActive]}
                  onPress={() => setEditKey(w2.key)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickName, editKey === w2.key && styles.pickNameActive]}>{w2.name}</Text>
                    <Text style={styles.pickGroup}>{w2.group}</Text>
                  </View>
                  {editKey === w2.key && <Text style={styles.pickCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.saveEditBtn, !editKey && styles.saveEditBtnDisabled]}
              onPress={saveEdit}
              disabled={!editKey}
            >
              <Text style={styles.saveEditBtnText}>Save changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity }}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <View style={styles.headerRight}>
          {showStartWorkout && (
            <TouchableOpacity
              style={styles.startWorkoutBtn}
              onPress={() => navigation.replace('WarmupQuestion', { profileName })}
            >
              <Text style={styles.startWorkoutText}>Start Workout</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Stats', { profileName, plan })}>
            <Text style={styles.statsBtn}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} nestedScrollEnabled>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthArrow}>
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dayLabels}>
          {DAY_LABELS.map((d) => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={C.text} />
        ) : (
          <View style={styles.grid}>
            {calendarDays.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={styles.cell} />
              const selected  = day === selectedDay
              const todayCell = isToday(day)
              const worked    = hasWorkout(day)
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.cell, selected && styles.cellSelected, todayCell && !selected && styles.cellToday]}
                  onPress={() => setSelectedDay(day === selectedDay ? null : day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cellText, selected && styles.cellTextSelected, todayCell && !selected && styles.cellTextToday]}>
                    {day}
                  </Text>
                  {worked && <View style={[styles.dot, selected && styles.dotSelected]} />}
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {selectedDay && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {MONTH_NAMES[month]} {selectedDay}, {year}
            </Text>
            {selectedEntries.length === 0
              ? <Text style={styles.empty}>No workout logged this day.</Text>
              : selectedEntries.map(renderEntry)
            }
          </View>
        )}


      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    startWorkoutBtn: {
      backgroundColor: C.primary, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 7,
    },
    startWorkoutText: { fontSize: 13, fontWeight: '700', color: C.primaryText },
    statsBtn: { fontSize: 15, color: C.subtext, fontWeight: '500' },
    backBtn: { fontSize: 15, color: C.subtext },

    scroll: { paddingBottom: 48 },

    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    monthArrow:     { padding: 8 },
    monthArrowText: { fontSize: 28, color: C.text, lineHeight: 32 },
    monthLabel:     { fontSize: 18, fontWeight: '700', color: C.text },

    dayLabels: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 6 },
    dayLabel: {
      flex: 1, textAlign: 'center',
      fontSize: 12, color: C.muted, fontWeight: '600', textTransform: 'uppercase',
    },

    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
    cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    cellSelected: { backgroundColor: C.primary },
    cellToday:    { backgroundColor: C.cellToday },
    cellText:     { fontSize: 15, color: C.text, fontWeight: '500' },
    cellTextSelected: { color: C.primaryText, fontWeight: '700' },
    cellTextToday:    { color: C.text, fontWeight: '700' },
    dot:         { width: 5, height: 5, borderRadius: 3, backgroundColor: C.dot, marginTop: 2 },
    dotSelected: { backgroundColor: C.dotSelected },

    section: { paddingHorizontal: 24, paddingTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14 },
    empty: { fontSize: 14, color: C.muted, fontStyle: 'italic' },

    entryCard: {
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
    },
    entryRow:     { flexDirection: 'row', alignItems: 'flex-start' },
    entryNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    entryName:    { fontSize: 15, fontWeight: '600', color: C.text },
    entrySub:     { fontSize: 13, color: C.subtext, marginTop: 2 },
    entryTime:    { fontSize: 12, color: C.muted, marginTop: 4 },
    warmupBadge: {
      fontSize: 11, fontWeight: '700', color: C.warmupChip.text,
      backgroundColor: C.warmupChip.bg, borderRadius: 6,
      paddingHorizontal: 6, paddingVertical: 2,
    },
    completeBadge: {
      fontSize: 11, fontWeight: '700', color: C.warmupChip.text,
      backgroundColor: C.warmupChip.bg, borderRadius: 6,
      paddingHorizontal: 6, paddingVertical: 2,
    },
    incompleteBadge: {
      fontSize: 11, fontWeight: '700', color: C.incompleteChip.text,
      backgroundColor: C.incompleteChip.bg, borderRadius: 6,
      paddingHorizontal: 6, paddingVertical: 2,
    },
    detailsHint: { fontSize: 12, color: C.subtext, marginTop: 4, fontWeight: '500' },

    exerciseLog: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: C.divider,
    },
    exerciseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    exerciseRowBorder: { borderTopWidth: 1, borderTopColor: C.divider },
    exerciseRowName:    { fontSize: 13, fontWeight: '500', color: C.text, flex: 1, marginRight: 8 },
    exerciseRowDetail:  { fontSize: 13, fontWeight: '600', color: C.text },
    exerciseRowPartial: { color: '#e08000' },
    exerciseRowSkipped: { fontSize: 13, color: C.muted, fontStyle: 'italic' },

    skippedTitle: { fontSize: 12, fontWeight: '700', color: C.subtext, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 },

    entryActions: { flexDirection: 'row', gap: 8, marginLeft: 8, alignItems: 'flex-start' },
    editBtn: {
      paddingHorizontal: 10, paddingVertical: 5,
      backgroundColor: C.secondary, borderRadius: 8,
    },
    editBtnText: { fontSize: 12, fontWeight: '600', color: C.subtext },
    deleteBtn: {
      paddingHorizontal: 10, paddingVertical: 5,
      backgroundColor: C.incompleteChip.bg, borderRadius: 8,
    },
    deleteBtnText: { fontSize: 12, fontWeight: '600', color: C.accent },
    confirmDeleteBtn: {
      paddingHorizontal: 10, paddingVertical: 5,
      backgroundColor: C.accent, borderRadius: 8,
    },
    confirmDeleteBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

    editPanel: { marginTop: 14, borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 14 },
    editPanelTitle: { fontSize: 13, fontWeight: '600', color: C.subtext, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
    workoutPicker: { maxHeight: 220, marginBottom: 12 },
    pickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 4,
      backgroundColor: C.pickRow,
    },
    pickRowActive: { backgroundColor: C.primary },
    pickName:      { fontSize: 14, fontWeight: '600', color: C.text },
    pickNameActive: { color: C.primaryText },
    pickGroup:     { fontSize: 12, color: C.subtext, marginTop: 1 },
    pickCheck:     { fontSize: 16, color: C.primaryText, marginLeft: 8 },
    saveEditBtn: {
      backgroundColor: C.primary, borderRadius: 10,
      paddingVertical: 12, alignItems: 'center',
    },
    saveEditBtnDisabled: { backgroundColor: C.muted },
    saveEditBtnText: { color: C.primaryText, fontSize: 14, fontWeight: '700' },
  })
}
