import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function WarmupSetting({ profileName, C }) {
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(`skipWarmup_${profileName}`).then((v) => setSkipped(v === 'true'))
  }, [profileName])

  if (!skipped) return null

  const reenable = async () => {
    await AsyncStorage.removeItem(`skipWarmup_${profileName}`)
    setSkipped(false)
  }

  return (
    <View style={{ paddingTop: 16 }}>
      <TouchableOpacity onPress={reenable}>
        <Text style={{ fontSize: 13, color: C.subtext }}>
          Warm-up prompt is off — tap to re-enable
        </Text>
      </TouchableOpacity>
    </View>
  )
}
