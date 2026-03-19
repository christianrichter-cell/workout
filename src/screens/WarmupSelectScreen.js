import React, { useEffect, useMemo, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Animated,
} from 'react-native'
import { WARMUP_OPTIONS } from '../data/workoutsData'
import { useTheme } from '../lib/theme'

const TYPE_LABELS = {
  run:     'Distance + Time',
  cycling: 'Distance + Time',
  plank:   'Duration',
}

export default function WarmupSelectScreen({ route, navigation }) {
  const { profileName } = route.params
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: 60, useNativeDriver: true }).start()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity }}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Warm-Up</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('History', { profileName, plan: null })}>
            <Text style={styles.headerBtn}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBtn}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={WARMUP_OPTIONS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WarmupActive', { profileName, exercise: item })}
          >
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{TYPE_LABELS[item.type] ?? ''}</Text>
            </View>
            <Text style={styles.cardArrow}>›</Text>
          </TouchableOpacity>
        )}
      />
      </Animated.View>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 24, paddingVertical: 20,
      borderBottomWidth: 1, borderBottomColor: C.border,
    },
    title: { fontSize: 20, fontWeight: '700', color: C.text },
    headerRight: { flexDirection: 'row', gap: 16 },
    headerBtn: { fontSize: 15, color: C.subtext, fontWeight: '500' },
    list: { paddingHorizontal: 24, paddingTop: 16, gap: 12 },
    card: {
      backgroundColor: C.card, borderRadius: 16,
      paddingVertical: 20, paddingHorizontal: 20,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    cardText: { flex: 1 },
    cardTitle: { fontSize: 17, fontWeight: '600', color: C.text },
    cardSub: { fontSize: 13, color: C.subtext, marginTop: 3 },
    cardArrow: { fontSize: 22, color: C.muted, marginLeft: 8 },
  })
}
