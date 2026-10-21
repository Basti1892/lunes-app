import { createStackNavigator } from '@react-navigation/stack'
import React, { ReactElement } from 'react'
import { useTheme } from 'styled-components/native'

import UnitSelectionScreen from '../routes/UnitSelectionScreen'
import StandardExercisesScreen from '../routes/exercises/StandardExercisesScreen'
import HomeScreen from '../routes/home/HomeScreen'
import ManageSelectionsScreen from '../routes/manage-selections/ManageSelectionsScreen'
import { getLabels } from '../services/helpers'
import { RoutesParams } from './NavigationTypes'
import screenOptions, { useStackScreenOptions, useTabletHeaderHeight } from './screenOptions'

// Home stack on web: only the screens of the minimal path (docs/web/0003-minimal-path-and-web-navigators.md).
// Keep the remaining screens in sync with HomeStackNavigator.tsx.

const Stack = createStackNavigator<RoutesParams>()

const HomeStackNavigator = (): ReactElement | null => {
  const options = screenOptions(useTabletHeaderHeight())
  const { manageJobs, overview, units } = getLabels().general.header
  const theme = useTheme()

  return (
    <Stack.Navigator screenOptions={useStackScreenOptions({ cardStyle: { backgroundColor: theme.colors.background } })}>
      <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name='UnitSelection'
        component={UnitSelectionScreen}
        options={({ navigation }) => options(overview, navigation)}
      />
      <Stack.Screen
        name='ManageSelection'
        component={ManageSelectionsScreen}
        options={({ navigation }) => options(manageJobs, navigation)}
      />
      <Stack.Screen
        name='StandardExercises'
        component={StandardExercisesScreen}
        options={({ navigation }) => options(units, navigation)}
      />
    </Stack.Navigator>
  )
}

export default HomeStackNavigator
