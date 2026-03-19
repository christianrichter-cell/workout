import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native'
import workoutImages from '../data/workoutImages'
import { useTheme } from '../lib/theme'

const LIMITS = {
  sets:      { min: 1, max: 5,   step: 1   },
  reps:      { min: 1, max: 20,  step: 1   },
  weight_kg: { min: 0, max: 150, step: 2.5 },
}

const ITEM_H = 42

export default function ExerciseCard({ exercise, settings, completedSets = [], onToggleSets, onSettingsChange }) {
  const { sets, reps, weight_kg } = settings
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])

  const exType = exercise.type ?? 'weights'
  const isCardio = exType === 'run' || exType === 'cycling'
  const isPlank  = exType === 'plank'

  const toggleSet = (index) => {
    const isDone = completedSets.includes(index)
    if (isDone) {
      onToggleSets(completedSets.filter((i) => i < index))
    } else {
      if (index > 0 && !completedSets.includes(index - 1)) return
      onToggleSets([...completedSets, index].sort((a, b) => a - b))
    }
  }

  return (
    <View style={styles.card}>

      {/* ── Photo ── */}
      <View style={styles.photoArea}>
        {workoutImages[exercise.name] ? (
          <Image source={workoutImages[exercise.name]} style={styles.photo} resizeMode="cover" />
        ) : exercise.photoUrl ? (
          <Image source={{ uri: exercise.photoUrl }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Photo coming soon</Text>
          </View>
        )}
      </View>

      {/* ── Controls ── */}
      <View style={styles.controlsRow}>
        {isCardio ? (
          <>
            <DrumPicker
              label="km"
              value={settings.weight_kg}
              min={0} max={50} step={0.1}
              onChange={(v) => onSettingsChange({ ...settings, weight_kg: v })}
              C={C}
            />
            <DrumPicker
              label="min"
              value={settings.reps / 2}
              min={0} max={120} step={0.5}
              format={(v) => {
                const m = Math.floor(v)
                const s = Math.round((v - m) * 60)
                return s === 0 ? String(m) : `${m}:${String(s).padStart(2, '0')}`
              }}
              onChange={(v) => onSettingsChange({ ...settings, reps: Math.round(v * 2) })}
              C={C}
            />
            <PaceDisplay type={exType} distKm={settings.weight_kg} timeMins={settings.reps / 2} C={C} />
          </>
        ) : isPlank ? (
          <>
            <DrumPicker
              label="Sets"
              value={sets}
              {...LIMITS.sets}
              onChange={(v) => onSettingsChange({ ...settings, sets: v })}
              C={C}
            />
            <DrumPicker
              label="sec"
              value={settings.reps}
              min={5} max={180} step={5}
              format={(v) => {
                const m = Math.floor(v / 60)
                const s = v % 60
                return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
              }}
              onChange={(v) => onSettingsChange({ ...settings, reps: v })}
              C={C}
            />
          </>
        ) : (
          <>
            <DrumPicker label="Sets" value={sets} {...LIMITS.sets} onChange={(v) => onSettingsChange({ ...settings, sets: v })} C={C} />
            <DrumPicker label="Reps" value={reps} {...LIMITS.reps} onChange={(v) => onSettingsChange({ ...settings, reps: v })} C={C} />
            <DrumPicker label="kg" value={weight_kg} {...LIMITS.weight_kg} onChange={(v) => onSettingsChange({ ...settings, weight_kg: v })} C={C} />
          </>
        )}
      </View>

      {/* ── Set buttons ── */}
      <View style={styles.setsRow}>
        {Array.from({ length: isCardio ? 1 : sets }).map((_, i) => {
          const done   = completedSets.includes(i)
          const locked = !done && i > 0 && !completedSets.includes(i - 1)
          return (
            <TouchableOpacity
              key={i}
              style={[styles.setBtn, done && styles.setBtnDone, locked && styles.setBtnLocked]}
              onPress={() => toggleSet(i)}
              activeOpacity={locked ? 1 : 0.7}
            >
              <Text style={[styles.setLabel, done && styles.setLabelDone, locked && styles.setLabelLocked]}>
                {done ? '✓' : isCardio ? 'Done' : `${i + 1}`}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

    </View>
  )
}

function DrumPicker({ label, value, min, max, step = 1, onChange, C, format }) {
  const scrollRef  = useRef(null)
  const debounce   = useRef(null)
  const lastOffset = useRef(0)
  const snapping   = useRef(false)

  const values = []
  const count = Math.round((max - min) / step) + 1
  for (let i = 0; i < count; i++) {
    values.push(parseFloat((min + i * step).toFixed(8)))
  }

  const idxOf = (v) => Math.max(0, Math.min(values.length - 1, Math.round((v - min) / step)))

  // scrollPos is a FLOAT — drives all progressive styling continuously
  const [scrollPos, setScrollPos] = useState(() => idxOf(value) * ITEM_H)

  const scrollToIdx = (idx, animated) => {
    snapping.current = animated
    scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated })
    if (animated) setTimeout(() => { snapping.current = false }, 350)
  }

  useEffect(() => {
    const t = setTimeout(() => {
      const idx = idxOf(value)
      setScrollPos(idx * ITEM_H)
      scrollToIdx(idx, false)
    }, 120)
    return () => clearTimeout(t)
  }, [])

  const prevValue = useRef(value)
  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value
      const idx = idxOf(value)
      setScrollPos(idx * ITEM_H)
      scrollToIdx(idx, true)
    }
  }, [value])

  const onScroll = (e) => {
    const offsetY = e.nativeEvent.contentOffset.y
    lastOffset.current = offsetY
    setScrollPos(offsetY)  // float update → smooth progressive re-render

    if (snapping.current) return
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      const snapIdx = Math.max(0, Math.min(values.length - 1,
        Math.round(lastOffset.current / ITEM_H)))
      scrollToIdx(snapIdx, true)
      onChange(values[snapIdx])
    }, 150)
  }

  const fmt = format ?? ((v) => (step < 1 && !Number.isInteger(v)) ? v.toFixed(1) : String(v))

  return (
    <View style={drumStyles.drum}>
      <Text style={[drumStyles.drumLabel, { color: C.subtext }]}>{label}</Text>
      <View style={drumStyles.drumWrap}>
        <View style={[drumStyles.drumBar, { backgroundColor: C.drumBar }]} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          contentContainerStyle={{ paddingVertical: ITEM_H }}
        >
          {values.map((v, i) => {
            // proximity: 1.0 when perfectly centred, 0.0 at ±1 row away
            const proximity  = Math.max(0, 1 - Math.abs(i - scrollPos / ITEM_H))
            const fontSize   = 13 + Math.round(proximity * 11)   // 13 → 24
            const opacity    = 0.2 + proximity * 0.8              // 0.2 → 1.0
            const fontWeight = proximity > 0.75 ? '700' : proximity > 0.3 ? '500' : '400'
            return (
              <View key={i} style={drumStyles.drumItem}>
                <Text style={{ fontSize, fontWeight, opacity, color: C.text }}>
                  {fmt(v)}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

function PaceDisplay({ type, distKm, timeMins, C }) {
  let label = type === 'cycling' ? 'km/h' : '/km'
  let pace = '—'
  if (distKm > 0 && timeMins > 0) {
    if (type === 'cycling') {
      pace = (distKm / (timeMins / 60)).toFixed(1)
    } else {
      const mpk = timeMins / distKm
      const m = Math.floor(mpk)
      const s = Math.round((mpk - m) * 60)
      pace = `${m}:${String(s).padStart(2, '0')}`
    }
  }
  return (
    <View style={drumStyles.drum}>
      <Text style={[drumStyles.drumLabel, { color: C.subtext }]}>{label}</Text>
      <View style={[drumStyles.drumWrap, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: C.text }}>{pace}</Text>
      </View>
    </View>
  )
}

// DrumPicker styles are layout-only (no colors) — colors applied inline
const drumStyles = StyleSheet.create({
  drum:      { flex: 1, alignItems: 'center' },
  drumLabel: { fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  drumWrap:  { height: ITEM_H * 3, width: '100%', overflow: 'hidden', position: 'relative' },
  drumBar:   { position: 'absolute', top: ITEM_H, left: 4, right: 4, height: ITEM_H, borderRadius: 10 },
  drumItem:  { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
})

function createStyles(C) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: C.card,
      borderRadius: 24,
      padding: 20,
    },
    photoArea: {
      flex: 1,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      minHeight: 80,
    },
    photo: { width: '100%', height: '100%' },
    photoPlaceholder: {
      flex: 1,
      backgroundColor: C.placeholder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoPlaceholderText: { fontSize: 14, color: C.muted },

    controlsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },

    setsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    setBtn: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: C.placeholder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setBtnDone:   { backgroundColor: C.primary },
    setBtnLocked: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.divider },
    setLabel:       { fontSize: 17, color: C.subtext, fontWeight: '500' },
    setLabelDone:   { color: C.primaryText },
    setLabelLocked: { color: C.muted },
  })
}
