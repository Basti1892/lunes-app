import { NavigatorScreenParams } from '@react-navigation/native'

import { StandardExerciseKey, SimpleResult } from '../constants/data'
import Job, { StandardJob } from '../models/Job'
import { StandardUnit, StandardUnitId, UserVocabularyUnit } from '../models/Unit'
import VocabularyItem, { UserVocabularyItem } from '../models/VocabularyItem'

export type VocabularyItemResult = {
  vocabularyItem: VocabularyItem
  result: SimpleResult | null
  numberOfTries: number
}

type ExerciseParams = {
  contentType: 'standard' | 'userVocabulary' | 'repetition'
  unitId: StandardUnitId | null
  unitTitle: string
  vocabularyItems: VocabularyItem[]
}

type VocabularyDetailExerciseParams = {
  vocabularyItemIndex: number
} & ExerciseParams

// UnitSelection and StandardExercises can also be opened by URL on web, then only the ids are known
// (docs/web/0008-url-linking.md). The apps always pass the objects.
export type UnitSelectionParams = { job: Job } | { jobId: number }

export type StandardExercisesParams = { unit: StandardUnit; jobTitle: string } | { jobId: number; unitId: number }
export type SpecialExercisesParams = {
  vocabularyItems: VocabularyItem[]
  unit: UserVocabularyUnit
  jobTitle: string
}

type ResultParams = ExerciseParams & {
  exercise: StandardExerciseKey
  results: VocabularyItemResult[]
}

export type BottomTabParams = {
  HomeTab: NavigatorScreenParams<HomeTabParams> | undefined
  FavoritesTab: undefined
  DictionaryTab: undefined
  RepetitionTab: undefined
  UserVocabularyTab: undefined
}

export type HomeTabParams = {
  Home: undefined
  Sponsors: undefined
  Settings: undefined
  Imprint: undefined
}

// https://github.com/Microsoft/Script/issues/15300
export type RoutesParams = {
  BottomTabNavigator: NavigatorScreenParams<BottomTabParams> | undefined
  HomeTab: undefined
  FavoritesTab: undefined
  DictionaryTab: undefined
  RepetitionTab: undefined
  UserVocabularyTab: undefined
  VocabularyCollection: undefined
  Home: undefined
  UserVocabularyOverview: undefined
  UserVocabularyProcess: {
    itemToEdit?: UserVocabularyItem
  }
  UserVocabularyList: undefined
  JobSelection: {
    initialSelection: boolean
    jobScope?: { type: 'contentArea'; token: string } | { type: 'lunesOnly' }
  }
  AddCustomDiscipline: undefined
  UnitSelection: UnitSelectionParams
  VocabularyDetailExercise: VocabularyDetailExerciseParams
  StandardExercises: StandardExercisesParams
  VocabularyList: ExerciseParams
  WordChoiceExercise: ExerciseParams
  ExerciseFinished: ResultParams
  Imprint: undefined
  ManageSelection: undefined
  Settings: undefined
  GdprExport: undefined
  OverlayMenu: undefined
  Sponsors: undefined
  Favorites: undefined
  Dictionary: undefined
  Repetition: undefined
  RepetitionWordList: undefined
  VocabularyDetail: { vocabularyItem: VocabularyItem }
  UserVocabularyUnitSelection: undefined
  SpecialExercises: SpecialExercisesParams
  TrainingExerciseSelection: {
    job: StandardJob
  }
  ImageTraining: {
    job: StandardJob
  }
  SentenceTraining: {
    job: StandardJob
  }
  TrainingFinished: {
    results: { correct: number; total: number }
    trainingType: 'image' | 'sentence' | 'speech'
    job: StandardJob
  }
  SpeechTraining: {
    job: StandardJob
  }
  Activation: {
    code: string
  }
  ActivationCodeEntry: undefined
}

export type Route = keyof RoutesParams
