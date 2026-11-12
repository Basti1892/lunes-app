import { StandardExerciseKey } from '../constants/data'
import { UnitId } from '../models/Unit'
import { VocabularyItemResult } from '../navigation/NavigationTypes'
import type { ResultReport } from '../services/ltiSession'

// Reports the result of a finished exercise to the LMS after an LTI launch (useReportResult.web.ts,
// docs/web/0016-grade-passback.md). The apps cannot be launched from an LMS, so nothing is reported.

export type ReportResultParams = {
  exercise: StandardExerciseKey
  results: VocabularyItemResult[]
  unitId: UnitId | null
  durationSeconds?: number
}

const notReported: ResultReport = { type: 'none' }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useReportResult = (params: ReportResultParams): ResultReport => notReported

export default useReportResult
