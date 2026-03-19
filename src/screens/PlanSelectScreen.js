import { useEffect, useMemo, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native'
import { useTheme } from '../lib/theme'
import RestTimerSetting from '../components/RestTimerSetting'
import WarmupSetting from '../components/WarmupSetting'

export default function PlanSelectScreen({ route, navigation }) {
  const { profileName } = route.params
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])

  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: 60, useNativeDriver: true }).start()
  }, [])

  const select = (plan) => {
    navigation.replace('WorkoutList', { profileName, plan })
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('History', { profileName, plan: null })}
      >
        <Text style={styles.historyBtnText}>History</Text>
      </TouchableOpacity>

      <Animated.View style={{ width: '100%', alignItems: 'center', opacity }}>
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.subtitle}>Hey Chris, which plan are you following?</Text>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={() => select('new')}>
            <Text style={styles.buttonLabel}>New Plan</Text>
            <Text style={styles.buttonSub}>Push / Pull / Hypertrophy / Arms</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => select('old')}>
            <Text style={[styles.buttonLabel, styles.buttonLabelSecondary]}>Old Plan</Text>
            <Text style={[styles.buttonSub, styles.buttonSubSecondary]}>Cardio / Chest / Back / Shoulders / Full Body</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerWrap}>
          <RestTimerSetting profileName={profileName} C={C} />
          <WarmupSetting profileName={profileName} C={C} />
        </View>

        <TouchableOpacity style={styles.switchBtn} onPress={() => navigation.replace('ProfileSelect')}>
          <Text style={styles.switchText}>Switch profile</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: C.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: C.subtext,
      marginBottom: 40,
    },
    buttons: {
      width: '100%',
      paddingHorizontal: 12,
      gap: 16,
    },
    button: {
      backgroundColor: C.primary,
      borderRadius: 18,
      paddingVertical: 22,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    buttonSecondary: {
      backgroundColor: C.secondary,
    },
    buttonLabel: {
      color: C.primaryText,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 4,
    },
    buttonLabelSecondary: {
      color: C.secondaryText,
    },
    buttonSub: {
      color: C.muted,
      fontSize: 13,
      textAlign: 'center',
    },
    buttonSubSecondary: {
      color: C.subtext,
    },
    timerWrap: {
      width: '100%',
      paddingHorizontal: 12,
      marginTop: 32,
    },
    historyBtn: {
      position: 'absolute',
      top: 56,
      right: 32,
      backgroundColor: C.historyChip,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    historyBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: C.historyChipText,
    },
    switchBtn: {
      marginTop: 28,
    },
    switchText: {
      fontSize: 14,
      color: C.muted,
    },
  })
}
