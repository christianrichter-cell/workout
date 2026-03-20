import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated, useWindowDimensions, Linking, ActivityIndicator,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase'
import { useProfileId } from '../hooks/useProfileId'
import { useTheme } from '../lib/theme'
import { findWorkout } from '../data/workoutsData'
import ExerciseCard from '../components/ExerciseCard'
import RestTimer from '../components/RestTimer'

const HEADER_H = 52
const INFO_H   = 88

const stateKey = (profileName, workoutKey) => `workout_state_${profileName}_${workoutKey}`

export default function ActiveWorkoutScreen({ route, navigation }) {
  const { profileName, plan, workoutKey, workoutName } = route.params
  const profileId = useProfileId(profileName)
  const { height: SCREEN_HEIGHT } = useWindowDimensions()
  const CARD_HEIGHT = SCREEN_HEIGHT - HEADER_H - INFO_H - 28

  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])

  const workout   = findWorkout(profileName, plan, workoutKey)
  const exercises = workout?.exercises ?? []

  const [settings, setSettings]           = useState({})
  const [completedSets, setCompletedSets] = useState({})
  const [restTimer, setRestTimer]         = useState(null)
  const [restDuration, setRestDuration]   = useState(90)
  const [currentIndex, setCurrentIndex]   = useState(0)
  const [showFinishOptions, setShowFinishOptions] = useState(null)
  const [confirmReset, setConfirmReset]           = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const saveTimeouts = useRef({})
  const scrollY = useRef(new Animated.Value(0)).current
  const flatListRef = useRef(null)
  const lastFlatOffset = useRef(0)
  const isSnapping = useRef(false)
  const snapDebounce = useRef(null)

  useEffect(() => {
    AsyncStorage.getItem(stateKey(profileName, workoutKey)).then((raw) => {
      if (raw) {
        try { setCompletedSets(JSON.parse(raw)) } catch (_) {}
      }
    })
  }, [workoutKey])

  useEffect(() => {
    if (!profileId) return

    Promise.all([
      supabase.from('profiles').select('rest_timer_seconds').eq('id', profileId).single(),
      supabase.from('exercise_settings').select('exercise_key, weight_kg, sets, reps')
        .eq('profile_id', profileId)
        .in('exercise_key', exercises.map((e) => e.key)),
    ]).then(([{ data: profileData }, { data: settingsData }]) => {
      if (profileData?.rest_timer_seconds) setRestDuration(profileData.rest_timer_seconds)
      const loaded = {}
      exercises.forEach((ex) => {
        const saved = settingsData?.find((r) => r.exercise_key === ex.key)
        loaded[ex.key] = saved
          ? { sets: saved.sets, reps: saved.reps, weight_kg: saved.weight_kg }
          : { sets: ex.defaultSets, reps: ex.defaultReps, weight_kg: ex.defaultWeight }
      })
      setSettings(loaded)
      setSettingsLoaded(true)
    })
  }, [profileId])

  const handleSettingsChange = (exerciseKey, newSettings) => {
    setSettings((prev) => ({ ...prev, [exerciseKey]: newSettings }))
    clearTimeout(saveTimeouts.current[exerciseKey])
    saveTimeouts.current[exerciseKey] = setTimeout(() => {
      if (!profileId) return
      supabase.from('exercise_settings').upsert({
        profile_id: profileId,
        exercise_key: exerciseKey,
        weight_kg: newSettings.weight_kg,
        sets: newSettings.sets,
        reps: newSettings.reps,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id,exercise_key' })
        .then(({ error }) => { if (error) console.error('settings save error', error) })
    }, 500)
  }

  const handleToggleSets = (exerciseKey, newSets) => {
    const prev = completedSets[exerciseKey] ?? []
    const setAdded = newSets.length > prev.length
    const next = { ...completedSets, [exerciseKey]: newSets }
    setCompletedSets(next)
    AsyncStorage.setItem(stateKey(profileName, workoutKey), JSON.stringify(next))
    if (setAdded) setRestTimer(restDuration)
  }

  const goHome = () => navigation.goBack()

  const buildExerciseLog = () =>
    exercises.map((ex) => {
      const s    = settings[ex.key] ?? { sets: ex.defaultSets, reps: ex.defaultReps, weight_kg: ex.defaultWeight }
      const type = ex.type ?? 'weights'
      const done = (completedSets[ex.key] ?? []).length
      const base = { name: ex.name, type, sets: s.sets, done }

      if (type === 'run' || type === 'cycling') {
        const distKm  = s.weight_kg
        const timeMins = s.reps / 2
        let pace = null
        if (distKm > 0 && timeMins > 0) {
          if (type === 'cycling') {
            pace = `${(distKm / (timeMins / 60)).toFixed(1)} km/h`
          } else {
            const mpk = timeMins / distKm
            const m   = Math.floor(mpk)
            const sec = Math.round((mpk - m) * 60)
            pace = `${m}:${String(sec).padStart(2, '0')} /km`
          }
        }
        return { ...base, distKm, timeMins, pace }
      }

      if (type === 'plank') {
        return { ...base, timeSec: s.reps }
      }

      return { ...base, reps: s.reps, kg: s.weight_kg }
    })

  const doFinish = async (incomplete = false) => {
    try {
      if (profileId) {
        const log = buildExerciseLog()
        const notesObj = { exercises: log }
        if (incomplete) notesObj.incomplete = true
        await supabase.from('workout_history').insert({
          profile_id: profileId,
          workout_key: workoutKey,
          notes: JSON.stringify(notesObj),
        })
      }
    } catch (_) {}
    await AsyncStorage.removeItem(stateKey(profileName, workoutKey))
    navigation.reset({
      index: 0,
      routes: profileName === 'Chris'
        ? [{ name: 'PlanSelect', params: { profileName } }]
        : [{ name: 'WorkoutList', params: { profileName, plan: null } }],
    })
  }

  const finishWorkout = () => {
    const allDone = exercises.every((ex) => {
      const done  = (completedSets[ex.key] ?? []).length
      const total = settings[ex.key]?.sets ?? ex.defaultSets
      return done >= total
    })
    if (allDone) { doFinish(false); return }
    const anySets = exercises.some((ex) => (completedSets[ex.key] ?? []).length > 0)
    setShowFinishOptions(anySets ? 'partial' : 'blocked')
  }

  const finishAnyway = () => doFinish(true)

  const resetWorkout = async () => {
    if (confirmReset) {
      setConfirmReset(false)
      await AsyncStorage.removeItem(stateKey(profileName, workoutKey))
      setCompletedSets({})
    } else {
      setConfirmReset(true)
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const first = viewableItems.find((v) => v.isViewable)
    if (first != null) setCurrentIndex(first.index)
  }).current
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current

  const currentExercise = exercises[currentIndex]

  const VELOCITY_THRESHOLD = 0.3

  const snapTo = (idx) => {
    clearTimeout(snapDebounce.current)
    const target = Math.max(0, Math.min(exercises.length - 1, idx)) * CARD_HEIGHT
    isSnapping.current = true
    flatListRef.current?.scrollToOffset({ offset: target, animated: true })
    setTimeout(() => { isSnapping.current = false }, 700)
  }

  // Fires when user lifts finger — use velocity to decide next/prev vs nearest
  const handleScrollEndDrag = (e) => {
    const offset = e.nativeEvent.contentOffset.y
    const vel = e.nativeEvent.velocity?.y ?? 0
    const nearestIdx = Math.round(offset / CARD_HEIGHT)
    if (Math.abs(vel) > VELOCITY_THRESHOLD) {
      snapTo(vel > 0 ? nearestIdx + 1 : nearestIdx - 1)
    } else {
      snapTo(nearestIdx)
    }
  }

  // Safety net: fires after native momentum finishes (e.g. on iOS WebKit)
  const handleMomentumEnd = (e) => {
    if (isSnapping.current) return
    snapTo(Math.round(e.nativeEvent.contentOffset.y / CARD_HEIGHT))
  }

  // Debounce fallback: catches slow drags where onScrollEndDrag may not fire
  const handleFlatListScroll = (e) => {
    lastFlatOffset.current = e.nativeEvent.contentOffset.y
    if (isSnapping.current) return
    clearTimeout(snapDebounce.current)
    snapDebounce.current = setTimeout(
      () => snapTo(Math.round(lastFlatOffset.current / CARD_HEIGHT)),
      300,
    )
  }

  const handleFlatListDragStart = () => {
    isSnapping.current = false
    clearTimeout(snapDebounce.current)
  }

  const openTutorial = () => {
    if (!currentExercise) return
    const q = encodeURIComponent(`${currentExercise.name} tutorial`)
    Linking.openURL(`https://www.youtube.com/results?search_query=${q}`)
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.dayHeader}>
        <Text style={styles.dayName}>{workoutName}</Text>
        <TouchableOpacity onPress={goHome}>
          <Text style={styles.homeBtn}>Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoTop}>
          <Text style={styles.exerciseName} numberOfLines={1}>
            {currentExercise?.name ?? ''}
          </Text>
          <Text style={styles.counter}>{currentIndex + 1} / {exercises.length}</Text>
        </View>
        <TouchableOpacity onPress={openTutorial}>
          <Text style={styles.ytLink}>▶ Tutorial on YouTube</Text>
        </TouchableOpacity>
      </View>

      {!settingsLoaded ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
      <Animated.FlatList
        ref={flatListRef}
        data={exercises}
        keyExtractor={(item) => item.key}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={handleFlatListDragStart}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false, listener: handleFlatListScroll }
        )}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * CARD_HEIGHT,
            index * CARD_HEIGHT,
            (index + 1) * CARD_HEIGHT,
          ]
          const opacity = scrollY.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' })
          const scale   = scrollY.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: 'clamp' })
          return (
            <Animated.View style={{ height: CARD_HEIGHT, opacity, transform: [{ scale }], paddingHorizontal: 16, paddingVertical: 4 }}>
              <ExerciseCard
                exercise={item}
                settings={settings[item.key] ?? { sets: item.defaultSets, reps: item.defaultReps, weight_kg: item.defaultWeight }}
                completedSets={completedSets[item.key] ?? []}
                onToggleSets={(newSets) => handleToggleSets(item.key, newSets)}
                onSettingsChange={(s) => handleSettingsChange(item.key, s)}
              />
            </Animated.View>
          )
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            {showFinishOptions === 'partial' ? (
              <>
                <TouchableOpacity style={styles.finishAnywayBtn} onPress={finishAnyway}>
                  <Text style={styles.finishAnywayText}>Finish anyway</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.continueBtn} onPress={() => setShowFinishOptions(null)}>
                  <Text style={styles.continueBtnText}>Continue workout</Text>
                </TouchableOpacity>
              </>
            ) : showFinishOptions === 'blocked' ? (
              <>
                <View style={styles.blockedBtn}>
                  <Text style={styles.blockedText}>Complete at least one set first</Text>
                </View>
                <TouchableOpacity style={styles.continueBtn} onPress={() => setShowFinishOptions(null)}>
                  <Text style={styles.continueBtnText}>Continue workout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout}>
                <Text style={styles.finishText}>Finish Workout</Text>
              </TouchableOpacity>
            )}
            {confirmReset ? (
              <View style={styles.resetConfirmRow}>
                <TouchableOpacity style={styles.resetConfirmBtn} onPress={resetWorkout}>
                  <Text style={styles.resetConfirmText}>Yes, reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetCancelBtn} onPress={() => setConfirmReset(false)}>
                  <Text style={styles.resetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.resetBtn} onPress={resetWorkout}>
                <Text style={styles.resetText}>Reset Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      )}

      {restTimer !== null && (
        <RestTimer
          key={restTimer + Date.now()}
          seconds={restTimer}
          onDismiss={() => setRestTimer(null)}
        />
      )}
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    dayHeader: {
      height: HEADER_H,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    dayName: { fontSize: 17, fontWeight: '700', color: C.text, textTransform: 'uppercase', letterSpacing: 0.8 },
    homeBtn: { fontSize: 15, color: C.subtext, fontWeight: '500' },

    infoBox: {
      height: INFO_H,
      paddingHorizontal: 24,
      paddingVertical: 14,
      backgroundColor: C.infoBox,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      justifyContent: 'center',
    },
    infoTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    exerciseName: { fontSize: 20, fontWeight: '700', color: C.text, flex: 1, marginRight: 12 },
    counter:  { fontSize: 13, color: C.muted, fontWeight: '500' },
    ytLink:   { fontSize: 13, color: C.accent, fontWeight: '600' },

    footer: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
      gap: 12,
    },
    finishBtn: {
      backgroundColor: C.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
    },
    finishText: { color: C.primaryText, fontSize: 17, fontWeight: '700' },
    finishAnywayBtn: {
      backgroundColor: C.accent,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
    },
    finishAnywayText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    blockedBtn: {
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      backgroundColor: C.card,
    },
    blockedText: { fontSize: 15, fontWeight: '600', color: C.subtext },
    continueBtn: {
      backgroundColor: C.bg,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: C.primary,
    },
    continueBtnText: { color: C.text, fontSize: 15, fontWeight: '600' },
    resetBtn: {
      backgroundColor: C.bg,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: C.accent,
    },
    resetText: { color: C.accent, fontSize: 15, fontWeight: '600' },
    resetConfirmRow: { flexDirection: 'row', gap: 10 },
    resetConfirmBtn: {
      flex: 1, backgroundColor: C.accent, borderRadius: 16,
      paddingVertical: 16, alignItems: 'center',
    },
    resetConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    resetCancelBtn: {
      flex: 1, backgroundColor: C.bg, borderRadius: 16,
      paddingVertical: 16, alignItems: 'center',
      borderWidth: 1.5, borderColor: C.muted,
    },
    resetCancelText: { color: C.subtext, fontSize: 15, fontWeight: '600' },
  })
}
