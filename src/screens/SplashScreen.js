import React, { useEffect, useRef, useState } from 'react'
import {
  View, Text, TouchableOpacity, Animated, StyleSheet, SafeAreaView,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../lib/theme'

export default function SplashScreen({ navigation }) {
  const C = useTheme()
  const [profileName, setProfileName] = useState(undefined)

  const textOpacity     = useRef(new Animated.Value(0)).current
  const btnOpacity      = useRef(new Animated.Value(0)).current
  const historyOpacity  = useRef(new Animated.Value(0)).current
  const selectorOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    AsyncStorage.getItem('activeProfile').then((name) => {
      setProfileName(name ?? null)
    })
  }, [])

  useEffect(() => {
    if (profileName === undefined) return

    if (profileName) {
      // Known user: stagger text → button → history link
      Animated.sequence([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
        Animated.timing(btnOpacity,  { toValue: 1, duration: 400, delay: 100, useNativeDriver: true }),
        Animated.timing(historyOpacity, { toValue: 1, duration: 300, delay: 80, useNativeDriver: true }),
      ]).start()
    } else {
      // New user: text then profile selector
      Animated.sequence([
        Animated.timing(textOpacity,     { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
        Animated.timing(selectorOpacity, { toValue: 1, duration: 400, delay: 150, useNativeDriver: true }),
      ]).start()
    }
  }, [profileName])

  const navigateForward = async (name) => {
    const skip = await AsyncStorage.getItem(`skipWarmup_${name}`)
    if (skip === 'true') {
      navigation.replace(name === 'Chris' ? 'PlanSelect' : 'WorkoutList', {
        profileName: name,
        ...(name !== 'Chris' && { plan: null }),
      })
    } else {
      navigation.replace('WarmupQuestion', { profileName: name })
    }
  }

  const selectProfile = async (name) => {
    await AsyncStorage.setItem('activeProfile', name)
    navigateForward(name)
  }

  const goToHistory = () => {
    navigation.navigate('History', { profileName, plan: null, showStartWorkout: true })
  }

  if (profileName === undefined) return <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} />

  const greeting = profileName
    ? `Hello ${profileName},\nare you ready to work out?`
    : `Hello,\nare you ready to work out?`

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.center}>
        <Animated.Text style={[styles.greeting, { color: C.text, opacity: textOpacity }]}>
          {greeting}
        </Animated.Text>

        {profileName ? (
          <>
            <Animated.View style={{ opacity: btnOpacity, marginTop: 56 }}>
              <TouchableOpacity
                style={[styles.goBtn, { backgroundColor: C.primary }]}
                onPress={() => navigateForward(profileName)}
                activeOpacity={0.85}
              >
                <Text style={[styles.goBtnText, { color: C.primaryText }]}>Let's GO!</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: historyOpacity, marginTop: 32 }}>
              <TouchableOpacity onPress={goToHistory}>
                <Text style={[styles.historyLink, { color: C.subtext }]}>View History</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        ) : (
          <Animated.View style={[styles.selector, { opacity: selectorOpacity }]}>
            {['Chris', 'Káťa'].map((name) => (
              <TouchableOpacity
                key={name}
                style={[styles.profileBtn, { backgroundColor: C.card }]}
                onPress={() => selectProfile(name)}
              >
                <Text style={[styles.profileBtnText, { color: C.text }]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  greeting: { fontSize: 28, fontWeight: '700', textAlign: 'center', lineHeight: 40 },
  goBtn: {
    width: 160, height: 160, borderRadius: 80,
    alignItems: 'center', justifyContent: 'center',
  },
  goBtnText: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  historyLink: { fontSize: 15, fontWeight: '500', textDecorationLine: 'underline' },
  selector: { marginTop: 48, width: '100%', gap: 14 },
  profileBtn: { borderRadius: 16, paddingVertical: 20, alignItems: 'center' },
  profileBtnText: { fontSize: 18, fontWeight: '600' },
})
