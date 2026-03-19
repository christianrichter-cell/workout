import React from 'react'
import { StatusBar, useColorScheme } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import SplashScreen          from '../screens/SplashScreen'
import WarmupQuestionScreen  from '../screens/WarmupQuestionScreen'
import WarmupSelectScreen    from '../screens/WarmupSelectScreen'
import WarmupActiveScreen    from '../screens/WarmupActiveScreen'
import ProfileSelectScreen   from '../screens/ProfileSelectScreen'
import PlanSelectScreen      from '../screens/PlanSelectScreen'
import WorkoutListScreen     from '../screens/WorkoutListScreen'
import ActiveWorkoutScreen   from '../screens/ActiveWorkoutScreen'
import HistoryScreen         from '../screens/HistoryScreen'
import StatsScreen           from '../screens/StatsScreen'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  const colorScheme = useColorScheme()

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
      />
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash"         component={SplashScreen} />
        <Stack.Screen name="WarmupQuestion" component={WarmupQuestionScreen} />
        <Stack.Screen name="WarmupSelect"   component={WarmupSelectScreen} />
        <Stack.Screen name="WarmupActive"   component={WarmupActiveScreen} />
        <Stack.Screen name="ProfileSelect"  component={ProfileSelectScreen} />
        <Stack.Screen name="PlanSelect"     component={PlanSelectScreen} />
        <Stack.Screen name="WorkoutList"    component={WorkoutListScreen} />
        <Stack.Screen name="ActiveWorkout"  component={ActiveWorkoutScreen} options={{ headerShown: false }} />
        <Stack.Screen name="History"        component={HistoryScreen}        options={{ headerShown: false }} />
        <Stack.Screen name="Stats"          component={StatsScreen}          options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
