import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking, ScrollView,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { useProfileId } from '../hooks/useProfileId'
import { useTheme } from '../lib/theme'
import ExerciseCard from '../components/ExerciseCard'

export default function WarmupActiveScreen({ route, navigation }) {
  const { profileName, exercise } = route.params
  const profileId = useProfileId(profileName)
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])

  const [settings, setSettings] = useState({
    sets: exercise.defaultSets,
    reps: exercise.defaultReps,
    weight_kg: exercise.defaultWeight,
  })
  const [completedSets, setCompletedSets] = useState([])
  const saveTimeout = useRef(null)

  useEffect(() => {
    if (!profileId) return
    supabase
      .from('exercise_settings')
      .select('weight_kg, sets, reps')
      .eq('profile_id', profileId)
      .eq('exercise_key', exercise.key)
      .single()
      .then(({ data }) => {
        if (data) setSettings({ sets: data.sets, reps: data.reps, weight_kg: data.weight_kg })
      })
  }, [profileId])

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      if (!profileId) return
      supabase.from('exercise_settings').upsert({
        profile_id: profileId,
        exercise_key: exercise.key,
        weight_kg: newSettings.weight_kg,
        sets: newSettings.sets,
        reps: newSettings.reps,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id,exercise_key' })
        .then(({ error }) => { if (error) console.error('warmup settings error', error) })
    }, 500)
  }

  const openTutorial = () => {
    const q = encodeURIComponent(`${exercise.name} tutorial`)
    Linking.openURL(`https://www.youtube.com/results?search_query=${q}`)
  }

  const finishWarmup = async () => {
    try {
      if (profileId) {
        const type = exercise.type ?? 'weights'
        let exLog = { name: exercise.name, type, sets: settings.sets, done: completedSets.length }
        if (type === 'run' || type === 'cycling') {
          const distKm = settings.weight_kg
          const timeMins = settings.reps / 2
          let pace = null
          if (distKm > 0 && timeMins > 0) {
            if (type === 'cycling') {
              pace = `${(distKm / (timeMins / 60)).toFixed(1)} km/h`
            } else {
              const mpk = timeMins / distKm
              const m = Math.floor(mpk)
              const sec = Math.round((mpk - m) * 60)
              pace = `${m}:${String(sec).padStart(2, '0')} /km`
            }
          }
          exLog = { ...exLog, distKm, timeMins, pace }
        } else if (type === 'plank') {
          exLog = { ...exLog, timeSec: settings.reps }
        }
        await supabase.from('workout_history').insert({
          profile_id: profileId,
          workout_key: exercise.key,
          notes: JSON.stringify({ is_warmup: true, exercises: [exLog] }),
        })
      }
    } catch (_) {}
    navigation.reset({
      index: 0,
      routes: profileName === 'Chris'
        ? [{ name: 'PlanSelect', params: { profileName } }]
        : [{ name: 'WorkoutList', params: { profileName, plan: null } }],
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Warm-Up</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={openTutorial}>
          <Text style={styles.ytLink}>▶ Tutorial on YouTube</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.cardWrap}>
          <ExerciseCard
            exercise={exercise}
            settings={settings}
            completedSets={completedSets}
            onToggleSets={setCompletedSets}
            onSettingsChange={handleSettingsChange}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.finishBtn} onPress={finishWarmup}>
            <Text style={styles.finishText}>Finish Warm-Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: {
      height: 52, paddingHorizontal: 24,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: C.text, textTransform: 'uppercase', letterSpacing: 0.8 },
    backBtn: { fontSize: 15, color: C.subtext, fontWeight: '500' },
    infoBox: {
      paddingHorizontal: 24, paddingVertical: 14,
      backgroundColor: C.infoBox, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    exerciseName: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 6 },
    ytLink: { fontSize: 13, color: C.accent, fontWeight: '600' },
    scroll: { padding: 16, gap: 16 },
    cardWrap: { height: 420 },
    footer: { paddingHorizontal: 4, paddingBottom: 24 },
    finishBtn: {
      backgroundColor: C.primary, borderRadius: 16,
      paddingVertical: 18, alignItems: 'center',
    },
    finishText: { color: C.primaryText, fontSize: 17, fontWeight: '700' },
  })
}
