import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../lib/theme'

export default function WarmupQuestionScreen({ route, navigation }) {
  const { profileName } = route.params
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])
  const [dontAskAgain, setDontAskAgain] = useState(false)

  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 400, delay: 80, useNativeDriver: true }).start()
  }, [])

  const goForward = () => {
    navigation.reset({
      index: 0,
      routes: profileName === 'Chris'
        ? [{ name: 'PlanSelect', params: { profileName } }]
        : [{ name: 'WorkoutList', params: { profileName, plan: null } }],
    })
  }

  const handleNo = async () => {
    if (dontAskAgain) {
      await AsyncStorage.setItem(`skipWarmup_${profileName}`, 'true')
    }
    goForward()
  }

  const handleYes = () => navigation.navigate('WarmupSelect', { profileName })

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.inner, { opacity }]}>

        <View style={styles.center}>
          <Text style={styles.question}>Would you like to warm up{'\n'}before your workout?</Text>

          <View style={styles.btnStack}>
            <TouchableOpacity style={styles.yesBtn} onPress={handleYes}>
              <Text style={styles.yesBtnText}>Yes, let's warm up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noBtn} onPress={handleNo}>
              <Text style={styles.noBtnText}>No, skip warm-up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipRow} onPress={() => setDontAskAgain((v) => !v)}>
            <View style={[styles.checkbox, dontAskAgain && styles.checkboxOn]}>
              {dontAskAgain && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.skipLabel}>Don't ask me again</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('History', { profileName, plan: null })}
        >
          <Text style={styles.historyBtnText}>View History</Text>
        </TouchableOpacity>

      </Animated.View>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    inner: { flex: 1, paddingHorizontal: 28, paddingBottom: 32, justifyContent: 'space-between' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    question: {
      fontSize: 24, fontWeight: '700', color: C.text,
      textAlign: 'center', lineHeight: 34, marginBottom: 48,
    },
    btnStack: { width: '100%', gap: 14, marginBottom: 32 },
    yesBtn: {
      width: '100%', backgroundColor: C.primary,
      borderRadius: 16, paddingVertical: 20, alignItems: 'center',
    },
    yesBtnText: { color: C.primaryText, fontSize: 18, fontWeight: '700' },
    noBtn: {
      width: '100%', backgroundColor: C.secondary,
      borderRadius: 16, paddingVertical: 20, alignItems: 'center',
      borderWidth: 1.5, borderColor: C.border,
    },
    noBtnText: { color: C.text, fontSize: 18, fontWeight: '600' },
    skipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    checkbox: {
      width: 22, height: 22, borderRadius: 6,
      borderWidth: 1.5, borderColor: C.muted,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: C.primary, borderColor: C.primary },
    checkmark: { color: C.primaryText, fontSize: 13, fontWeight: '700' },
    skipLabel: { fontSize: 14, color: C.subtext },
    historyBtn: {
      width: '100%', backgroundColor: C.card,
      borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    },
    historyBtnText: { fontSize: 16, fontWeight: '600', color: C.text },
  })
}
