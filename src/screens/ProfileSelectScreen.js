import { useEffect, useMemo, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../lib/theme'

const PROFILES = ['Chris', 'Káťa']

export default function ProfileSelectScreen({ navigation }) {
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: 60, useNativeDriver: true }).start()
  }, [])

  const selectProfile = async (name) => {
    await AsyncStorage.setItem('activeProfile', name)
    if (name === 'Chris') {
      navigation.replace('PlanSelect', { profileName: name })
    } else {
      navigation.replace('WorkoutList', { profileName: name, plan: null })
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ width: '100%', alignItems: 'center', opacity }}>
        <Text style={styles.title}>Who's working out?</Text>
        <View style={styles.buttons}>
          {PROFILES.map((name) => (
            <TouchableOpacity key={name} style={styles.button} onPress={() => selectProfile(name)}>
              <Text style={styles.buttonText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: C.text,
      marginBottom: 40,
    },
    buttons: {
      width: '100%',
      paddingHorizontal: 48,
      gap: 16,
    },
    button: {
      backgroundColor: C.primary,
      borderRadius: 16,
      paddingVertical: 22,
      alignItems: 'center',
    },
    buttonText: {
      color: C.primaryText,
      fontSize: 20,
      fontWeight: '600',
    },
  })
}
