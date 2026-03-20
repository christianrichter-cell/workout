import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, Animated, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const SIZE = 240
const RADIUS = 104
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RestTimer({ seconds, onDismiss }) {
  const [remaining, setRemaining] = useState(seconds)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
  }, [])

  useEffect(() => {
    if (remaining <= 0) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(onDismiss)
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const progress = remaining / seconds
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity activeOpacity={0.85} onPress={onDismiss} style={styles.circle}>
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#e53935"
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${SIZE / 2}, ${SIZE / 2})`}
          />
        </Svg>
        <Text style={styles.time}>{remaining}s</Text>
        <Text style={styles.skip}>Skip!</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    color: '#ffffff',
    fontSize: 54,
    fontWeight: '700',
    letterSpacing: -2,
  },
  skip: {
    color: '#e53935',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 0.5,
  },
})
