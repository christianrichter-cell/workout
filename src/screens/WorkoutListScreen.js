import { useEffect, useMemo, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Animated } from 'react-native'
import { getWorkoutDays } from '../data/workoutsData'
import { useTheme } from '../lib/theme'
import RestTimerSetting from '../components/RestTimerSetting'
import WarmupSetting from '../components/WarmupSetting'

export default function WorkoutListScreen({ route, navigation }) {
  const { profileName, plan } = route.params
  const C = useTheme()
  const styles = useMemo(() => createStyles(C), [C])
  const workoutDays = getWorkoutDays(profileName, plan)
  const opacity = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 350, delay: 60, useNativeDriver: true }).start()
  }, [])

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ActiveWorkout', {
        profileName,
        plan,
        workoutKey: item.key,
        workoutName: item.name,
      })}
    >
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.subtitle ? (
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        ) : null}
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  )

  const footer = (
    <View style={styles.footer}>
      <RestTimerSetting profileName={profileName} C={C} />
      <WarmupSetting profileName={profileName} C={C} />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {profileName}</Text>
          {plan ? (
            <Text style={styles.planBadge}>{plan === 'new' ? 'New Plan' : 'Old Plan'}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => {
          if (profileName === 'Chris') {
            navigation.replace('PlanSelect', { profileName })
          } else {
            navigation.replace('ProfileSelect')
          }
        }}>
          <Text style={styles.switchText}>
            {profileName === 'Chris' ? 'Change plan' : 'Switch'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={styles.subtitle}>Choose a workout</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('History', { profileName, plan })}
          style={styles.historyBtn}
        >
          <Text style={styles.historyBtnText}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={workoutDays}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListFooterComponent={footer}
      />
      </Animated.View>
    </SafeAreaView>
  )
}

function createStyles(C) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 16,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: C.text,
    },
    planBadge: {
      fontSize: 13,
      color: C.subtext,
      marginTop: 2,
    },
    switchText: {
      fontSize: 15,
      color: C.subtext,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginTop: 4,
      marginBottom: 24,
    },
    subtitle: {
      fontSize: 14,
      color: C.subtext,
    },
    historyBtn: {
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
    list: {
      paddingHorizontal: 24,
      gap: 12,
      paddingBottom: 16,
    },
    card: {
      backgroundColor: C.card,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardText: { flex: 1 },
    cardTitle: {
      fontSize: 17,
      fontWeight: '500',
      color: C.text,
    },
    cardSubtitle: {
      fontSize: 13,
      color: C.subtext,
      marginTop: 3,
    },
    cardArrow: {
      fontSize: 22,
      color: C.muted,
      marginLeft: 8,
    },
    footer: {
      paddingHorizontal: 0,
      paddingTop: 8,
      paddingBottom: 32,
    },
  })
}
