import { RouteProp } from '@react-navigation/native'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import React, { ReactElement } from 'react'
import { useTheme } from 'styled-components/native'

import UnitSelectionScreen from '../routes/UnitSelectionScreen'
import StandardExercisesScreen from '../routes/exercises/StandardExercisesScreen'
import HomeScreen from '../routes/home/HomeScreen'
import ManageSelectionsScreen from '../routes/manage-selections/ManageSelectionsScreen'
import { useEmbeddedMode } from '../services/EmbeddedModeService'
import { getLabels } from '../services/helpers'
import BackToCourseLink, { isWebUrl } from './BackToCourseLink'
import { RoutesParams } from './NavigationTypes'
import screenOptions, { useStackScreenOptions, useTabletHeaderHeight } from './screenOptions'

// Home stack on web: only the screens of the minimal path (docs/web/0003-minimal-path-and-web-navigators.md).
// Keep the remaining screens in sync with HomeStackNavigator.tsx.
// In the embedded mode after an LTI launch, the vocabulary set selected in the LMS is the only screen of the stack.
// Its header leads back to the course instead of the unit selection (docs/web/0015-embedded-mode.md).

const Stack = createStackNavigator<RoutesParams>()

type EmbeddedUnitScreenProps = {
  route: RouteProp<RoutesParams, 'StandardExercises'>
  navigation: StackNavigationProp<RoutesParams, 'StandardExercises'>
}

// Always the unit of the session, never the one from the URL: React Navigation fills the params from the URL, and they
// win over initialParams. The address bar may keep another unit ID; it has no effect.
const EmbeddedUnitScreen = ({ route, navigation }: EmbeddedUnitScreenProps): ReactElement | null => {
  const embeddedMode = useEmbeddedMode()
  if (embeddedMode.type !== 'active') {
    return null
  }
  const { jobId, unitId } = embeddedMode.session
  return <StandardExercisesScreen route={{ ...route, params: { jobId, unitId } }} navigation={navigation} />
}

const HomeStackNavigator = (): ReactElement | null => {
  const options = screenOptions(useTabletHeaderHeight())
  const { manageJobs, overview, units } = getLabels().general.header
  const theme = useTheme()

  const stackScreenOptions = useStackScreenOptions({ cardStyle: { backgroundColor: theme.colors.background } })
  const embeddedMode = useEmbeddedMode()

  if (embeddedMode.type === 'active') {
    const { jobId, unitId, returnUrl } = embeddedMode.session
    const headerLeft =
      returnUrl !== null && isWebUrl(returnUrl) ? () => <BackToCourseLink url={returnUrl} /> : () => null
    // The key starts a new stack with the selected set, even if the URL pointed elsewhere
    return (
      <Stack.Navigator key={`embedded-${jobId}-${unitId}`} screenOptions={stackScreenOptions}>
        <Stack.Screen
          name='StandardExercises'
          component={EmbeddedUnitScreen}
          initialParams={{ jobId, unitId }}
          options={({ navigation }) => ({ ...options(units, navigation), headerLeft })}
        />
      </Stack.Navigator>
    )
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
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
