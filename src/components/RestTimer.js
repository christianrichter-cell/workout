import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 240
const RADIUS = 104
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RestTimer({ seconds, onDismiss }) {
  const [remaining, setRemaining] = useState(seconds)
  const fadeAnim     = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(CIRCUMFERENCE)).current
  const wakeLockRef  = useRef(null)
  const intervalRef  = useRef(null)
  // Wall-clock end time — survives JS suspension on lock
  const endTimeRef   = useRef(Date.now() + seconds * 1000)

  // Start (or restart) the ring animation from a real seconds value
  const startRing = (fromSecs) => {
    const dashLen = Math.max(0, (fromSecs / seconds)) * CIRCUMFERENCE
    progressAnim.stopAnimation()
    progressAnim.setValue(dashLen)
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: fromSecs * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start()
  }

  const handleComplete = () => {
    clearInterval(intervalRef.current)
    const appVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'
    if (appVisible) {
      // Foreground: vibrate only — no notification spam while user is watching
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([300, 100, 300])
      }
    } else {
      // Backgrounded / locked: push notification so user knows to come back
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('Rest complete!', {
            body: 'Time to get back to it 💪',
            icon: '/apple-touch-icon.png',
          })
        } catch (_) {}
      }
    }
    Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(onDismiss)
  }

  // ── Wake Lock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let released = false

    const acquire = async () => {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
      try { wakeLockRef.current = await navigator.wakeLock.request('screen') } catch (_) {}
    }

    const onVisibility = () => {
      if (released) return
      if (document.visibilityState === 'visible') {
        acquire()
        const real = (endTimeRef.current - Date.now()) / 1000
        if (real <= 0) {
          // Timer expired while phone was locked — notify now that screen is back
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
              new Notification('Rest complete!', {
                body: 'Time to get back to it 💪',
                icon: '/apple-touch-icon.png',
              })
            } catch (_) {}
          }
          Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(onDismiss)
        } else {
          // Still running — resync to real elapsed time
          setRemaining(Math.ceil(real))
          startRing(real)
        }
      }
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      released = true
      document.removeEventListener('visibilitychange', onVisibility)
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  // ── Countdown (wall-clock based, 500 ms poll so resume is near-instant) ───
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
    startRing(seconds)

    intervalRef.current = setInterval(() => {
      const real = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      if (real <= 0) {
        setRemaining(0)
        handleComplete()
      } else {
        setRemaining(real)
      }
    }, 500)

    return () => clearInterval(intervalRef.current)
  }, [])

  const dashArray = progressAnim.interpolate({
    inputRange:  [0, CIRCUMFERENCE],
    outputRange: [`0 ${CIRCUMFERENCE}`, `${CIRCUMFERENCE} 0`],
  })

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
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#e53935"
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={dashArray}
            strokeDashoffset={progressAnim}
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
