import { renderHook, waitFor } from '@testing-library/react-native'
import React, { ReactElement } from 'react'

import { StandardExerciseKeys } from '../../constants/data'
import { VocabularyItemResult } from '../../navigation/NavigationTypes'
import { EmbeddedMode, EmbeddedModeContext } from '../../services/EmbeddedModeService'
import { TOKEN_STORAGE_KEY } from '../../services/ltiSession'
import VocabularyItemBuilder from '../../testing/VocabularyItemBuilder'
import useReportResult, { ReportResultParams } from '../useReportResult.web'

const active: EmbeddedMode = { type: 'active', session: { jobId: 47, unitId: 304, returnUrl: null, expiresAt: 1 } }

const vocabularyItems = new VocabularyItemBuilder(4).build()
const results: VocabularyItemResult[] = vocabularyItems.map((vocabularyItem, index) => ({
  vocabularyItem,
  result: index < 3 ? 'correct' : 'incorrect',
  numberOfTries: index < 2 ? 1 : 3,
}))

const params: ReportResultParams = {
  exercise: StandardExerciseKeys.wordChoiceExercise,
  results,
  unitId: { type: 'standard', id: 304 },
}

describe('useReportResult (web)', () => {
  const originalWindow = globalThis.window
  const originalFetch = globalThis.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    const sessionStorage = { getItem: (key: string) => (key === TOKEN_STORAGE_KEY ? 'abc' : null) }
    Object.defineProperty(globalThis, 'window', { value: { sessionStorage }, configurable: true, writable: true })
    fetchMock = jest.fn().mockResolvedValue({ status: 204, ok: true })
    globalThis.fetch = fetchMock
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true, writable: true })
    globalThis.fetch = originalFetch
  })

  const renderReport = (embeddedMode: EmbeddedMode, reportParams: ReportResultParams) =>
    renderHook(() => useReportResult(reportParams), {
      wrapper: ({ children }: { children: ReactElement }) => (
        <EmbeddedModeContext.Provider value={embeddedMode}>{children}</EmbeddedModeContext.Provider>
      ),
    })

  it('should send the words correct on the first try once', async () => {
    const { result, rerender } = renderReport(active, params)

    await waitFor(() => expect(result.current).toEqual({ type: 'submitted' }))
    rerender({})
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ correct: 2, total: 4 })
  })

  it('should not send anything when standalone', () => {
    const { result } = renderReport({ type: 'standalone' }, params)

    expect(result.current).toEqual({ type: 'none' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('should not send results of other units or exercises', () => {
    renderReport(active, { ...params, unitId: { type: 'standard', id: 1 } })
    renderReport(active, { ...params, exercise: StandardExerciseKeys.vocabularyList })

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
