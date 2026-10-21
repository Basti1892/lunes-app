import { createStackNavigator } from '@react-navigation/stack'
import React, { ReactElement } from 'react'

import useStorage from '../hooks/useStorage'
import useTrackSession from '../hooks/useTrackSession'
import VocabularyListScreen from '../routes/VocabularyListScreen'
import WordChoiceExerciseScreen from '../routes/choice-exercises/WordChoiceExerciseScreen'
import ExerciseFinishedScreen from '../routes/exercise-finished/ExerciseFinishedScreen'
import JobSelectionScreen from '../routes/job-selection/JobSelectionScreen'
import VocabularyDetailExerciseScreen from '../routes/vocabulary-detail-exercise/VocabularyDetailExerciseScreen'
import { getLabels } from '../services/helpers'
import BottomTabNavigator from './BottomTabNavigator'
import { RoutesParams } from './NavigationTypes'
import screenOptions, { useStackScreenOptions, useTabletHeaderHeight } from './screenOptions'

// Root navigator on web: only the screens of the minimal path (docs/web/0003-minimal-path-and-web-navigators.md).
// Keep the remaining screens in sync with Navigator.tsx.

const Stack = createStackNavigator<RoutesParams>()

const HomeStackNavigator = (): ReactElement | null => {
  useTrackSession()
  const [jobs] = useStorage('selectedJobs')

  const headerHeight = useTabletHeaderHeight()
  const options = screenOptions(headerHeight)

  const { manageJobs, overviewExercises, cancelExercise } = getLabels().general.header

  return (
    <Stack.Navigator
      initialRouteName={jobs === null ? 'JobSelection' : 'BottomTabNavigator'}
      screenOptions={useStackScreenOptions()}
    >
      <Stack.Screen name='BottomTabNavigator' component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name='JobSelection'
        component={JobSelectionScreen}
        initialParams={{ initialSelection: true }}
        options={({ navigation }) => options(manageJobs, navigation)}
      />
      <Stack.Screen
        name='VocabularyList'
        component={VocabularyListScreen}
        options={({ navigation }) => options(overviewExercises, navigation, false)}
      />
      <Stack.Screen
        name='VocabularyDetailExercise'
        component={VocabularyDetailExerciseScreen}
        options={({ navigation }) => options('', navigation, true)}
      />
      <Stack.Screen
        name='WordChoiceExercise'
        component={WordChoiceExerciseScreen}
        options={({ navigation }) => options(cancelExercise, navigation, true)}
      />
      <Stack.Screen name='ExerciseFinished' component={ExerciseFinishedScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default HomeStackNavigator
