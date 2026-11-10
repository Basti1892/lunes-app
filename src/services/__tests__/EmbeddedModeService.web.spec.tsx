import { renderHook, waitFor } from '@testing-library/react-native'
import React, { ReactElement } from 'react'

import EmbeddedModeProvider, { useEmbeddedMode } from '../EmbeddedModeService.web'
import { TOKEN_STORAGE_KEY } from '../ltiSession'

const session = { jobId: 3, unitId: 7, returnUrl: null, expiresAt: 1 }

describe('EmbeddedModeService (web)', () => {
  const wrapper = ({ children }: { children: ReactElement }): ReactElement => (
    <EmbeddedModeProvider>{children}</EmbeddedModeProvider>
  )

  const setStoredToken = (token: string | null): void => {
    const sessionStorage = { getItem: (key: string) => (key === TOKEN_STORAGE_KEY ? token : null) }
    Object.defineProperty(globalThis, 'window', { value: { sessionStorage }, configurable: true, writable: true })
  }

  const mockFetch = (status: number, body: unknown): jest.Mock => {
    const fetchMock = jest.fn().mockResolvedValue({ status, ok: status === 200, json: async () => body })
    globalThis.fetch = fetchMock
    return fetchMock
  }

  const originalWindow = globalThis.window
  const originalFetch = globalThis.fetch

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', { value: originalWindow, configurable: true, writable: true })
    globalThis.fetch = originalFetch
  })

  it('should be standalone without a token', () => {
    setStoredToken(null)
    const fetchMock = mockFetch(200, session)

    const { result } = renderHook(() => useEmbeddedMode(), { wrapper })

    expect(result.current).toEqual({ type: 'standalone' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('should load the session of a token', async () => {
    setStoredToken('abc')
    mockFetch(200, session)

    const { result } = renderHook(() => useEmbeddedMode(), { wrapper })

    expect(result.current).toEqual({ type: 'loading' })
    await waitFor(() => expect(result.current).toEqual({ type: 'active', session }))
  })

  it('should report an expired session', async () => {
    setStoredToken('abc')
    mockFetch(401, { error: 'expired' })

    const { result } = renderHook(() => useEmbeddedMode(), { wrapper })

    await waitFor(() => expect(result.current).toEqual({ type: 'expired' }))
  })
})
