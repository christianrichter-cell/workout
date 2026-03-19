import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'

export default function RestTimer({ seconds, onDismiss }) {
  const [remaining, setRemaining] = useState(seconds)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (remaining <= 0) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(onDismiss)
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const progress = remaining / seconds

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.pill}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        <Text style={styles.label}>Rest  {remaining}s</Text>
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    zIndex: 99,
  },
  pill: {
    backgroundColor: '#111',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  skip: {
    color: '#e53935',
    fontSize: 14,
    fontWeight: '600',
  },
})
