import { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import { useProfileId } from '../hooks/useProfileId'

const MIN = 30
const MAX = 300
const STEP = 15

const fmt = (s) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (sec === 0) return `${m}:00`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function RestTimerSetting({ profileName, C }) {
  const profileId = useProfileId(profileName)
  const [seconds, setSeconds] = useState(90)
  const [saved, setSaved]     = useState(false)
  const saveRef = useRef(null)

  useEffect(() => {
    if (!profileId) return
    supabase
      .from('profiles')
      .select('rest_timer_seconds')
      .eq('id', profileId)
      .single()
      .then(({ data }) => {
        if (data?.rest_timer_seconds) setSeconds(data.rest_timer_seconds)
      })
  }, [profileId])

  const update = (val) => {
    const clamped = Math.max(MIN, Math.min(MAX, val))
    setSeconds(clamped)
    clearTimeout(saveRef.current)
    saveRef.current = setTimeout(async () => {
      if (!profileId) return
      await supabase
        .from('profiles')
        .update({ rest_timer_seconds: clamped })
        .eq('id', profileId)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 400)
  }

  const atMin = seconds <= MIN
  const atMax = seconds >= MAX

  return (
    <View style={[s.wrap, { backgroundColor: C.card }]}>
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: C.text }]}>Rest Timer</Text>
          <Text style={[s.subtitle, { color: C.subtext }]}>Duration between sets</Text>
        </View>
        {saved && <Text style={[s.saved, { color: C.accent }]}>Saved ✓</Text>}
      </View>

      <View style={s.controls}>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: C.bg }, atMin && { opacity: 0.3 }]}
          onPress={() => update(seconds - STEP)}
          activeOpacity={atMin ? 1 : 0.6}
        >
          <Text style={[s.btnText, { color: C.text }]}>−</Text>
        </TouchableOpacity>

        <Text style={[s.value, { color: C.text }]}>{fmt(seconds)}</Text>

        <TouchableOpacity
          style={[s.btn, { backgroundColor: C.bg }, atMax && { opacity: 0.3 }]}
          onPress={() => update(seconds + STEP)}
          activeOpacity={atMax ? 1 : 0.6}
        >
          <Text style={[s.btnText, { color: C.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title:    { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  saved:    { fontSize: 13, fontWeight: '600' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText:  { fontSize: 28, fontWeight: '300', lineHeight: 34 },
  value:    { fontSize: 44, fontWeight: '700', letterSpacing: -1 },
})
