import { extractToken, getStoredToken, loadLtiSession, takeTokenFromUrl, TOKEN_STORAGE_KEY } from '../ltiSession'

const createStorage = (): Pick<Storage, 'getItem' | 'setItem'> => {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => items.set(key, value),
  }
}

const session = { jobId: 3, unitId: 7, returnUrl: 'https://lms.example.org/course/view.php?id=1', expiresAt: 1 }

const response = (status: number, body: unknown): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as Response

describe('ltiSession', () => {
  describe('extractToken', () => {
    it('should split the token off the fragment', () => {
      expect(extractToken('#lti_token=abc.def')).toEqual({ token: 'abc.def', remainingHash: '' })
      expect(extractToken('#a=1&lti_token=abc')).toEqual({ token: 'abc', remainingHash: '#a=1' })
    })

    it('should return no token without one', () => {
      expect(extractToken('')).toEqual({ token: null, remainingHash: '' })
      expect(extractToken('#lti_token=')).toEqual({ token: null, remainingHash: '' })
    })
  })

  describe('takeTokenFromUrl', () => {
    it('should move the token into the storage and remove it from the URL', () => {
      const storage = createStorage()
      const history = { state: { key: 1 }, replaceState: jest.fn() }

      takeTokenFromUrl({ pathname: '/jobs/3/units/7', search: '?x=1', hash: '#lti_token=abc' }, history, storage)

      expect(getStoredToken(storage)).toBe('abc')
      expect(history.replaceState).toHaveBeenCalledWith({ key: 1 }, '', '/jobs/3/units/7?x=1')
    })

    it('should keep a stored token and the URL without a token in the URL', () => {
      const storage = createStorage()
      storage.setItem(TOKEN_STORAGE_KEY, 'earlier')
      const history = { state: null, replaceState: jest.fn() }

      takeTokenFromUrl({ pathname: '/jobs/3/units/7', search: '', hash: '' }, history, storage)

      expect(getStoredToken(storage)).toBe('earlier')
      expect(history.replaceState).not.toHaveBeenCalled()
    })
  })

  describe('loadLtiSession', () => {
    it('should send the token and return the session', async () => {
      const fetchMock = jest.fn().mockResolvedValue(response(200, session))

      await expect(loadLtiSession('abc', fetchMock)).resolves.toEqual({ type: 'active', session })
      expect(fetchMock).toHaveBeenCalledWith('/lti/session', {
        headers: { Authorization: 'Bearer abc' },
        cache: 'no-store',
      })
    })

    it('should report an expired session', async () => {
      const fetchMock = jest.fn().mockResolvedValue(response(401, { error: 'expired' }))

      await expect(loadLtiSession('abc', fetchMock)).resolves.toEqual({ type: 'expired' })
    })

    it('should report errors of the server, invalid answers and network errors', async () => {
      await expect(loadLtiSession('abc', jest.fn().mockResolvedValue(response(502, {})))).resolves.toEqual({
        type: 'error',
      })
      await expect(loadLtiSession('abc', jest.fn().mockResolvedValue(response(200, { jobId: '3' })))).resolves.toEqual({
        type: 'error',
      })
      await expect(loadLtiSession('abc', jest.fn().mockRejectedValue(new TypeError('offline')))).resolves.toEqual({
        type: 'error',
      })
    })
  })
})
