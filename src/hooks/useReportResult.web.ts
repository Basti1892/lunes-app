import { useEffect, useRef, useState } from 'react'

import { StandardExerciseKeys } from '../constants/data'
import { useEmbeddedMode } from '../services/EmbeddedModeService'
import { getStoredToken, ResultReport, sendResult } from '../services/ltiSession'
import type { ReportResultParams } from './useReportResult'

export type { ReportResultParams }

const readToken = (): string | null => {
  try {
    return getStoredToken(window.sessionStorage)
  } catch {
    return null
  }
}

// After an LTI launch, the result of the word choice exercise of the selected unit goes to the LMS gradebook:
// words correct on the first try out of all words, like on the result screen (docs/web/0016-grade-passback.md).
// Each finished attempt is sent once; the LMS keeps the latest.
const useReportResult = ({ exercise, results, unitId }: ReportResultParams): ResultReport => {
  const embeddedMode = useEmbeddedMode()
  const [report, setReport] = useState<ResultReport>({ type: 'none' })
  // Survives the double effect of React's strict mode, so a result is only sent once
  const isSent = useRef(false)

  const isGradedResult =
    embeddedMode.type === 'active' &&
    exercise === StandardExerciseKeys.wordChoiceExercise &&
    unitId?.type === 'standard' &&
    unitId.id === embeddedMode.session.unitId &&
    results.length > 0

  useEffect(() => {
    if (!isGradedResult || isSent.current) {
      return
    }
    const token = readToken()
    if (token === null) {
      setReport({ type: 'expired' })
      return
    }
    isSent.current = true
    setReport({ type: 'sending' })
    const correct = results.filter(result => result.numberOfTries === 1).length
    sendResult(token, { correct, total: results.length })
      .then(setReport)
      .catch(() => setReport({ type: 'error' }))
  }, [isGradedResult, results])

  return report
}

export default useReportResult
