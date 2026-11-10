import { WEB_BASE_PATH } from '../constants/webBasePath'

// Session of an LTI launch (docs/web/0013-lti-connector-service.md, docs/web/0015-embedded-mode.md).
// lunes-lti redirects into the app with a short-lived session token in the URL fragment (#lti_token=...).
// Only used by the web version: index.web.js and EmbeddedModeService.web.tsx.

export const TOKEN_FRAGMENT_PARAM = 'lti_token'
export const TOKEN_STORAGE_KEY = 'lunes-lti-token'
// lunes-lti answers 401 for an expired, unknown or missing token
const HTTP_UNAUTHORIZED = 401

export type LtiSession = {
  jobId: number
  unitId: number
  // Page of the LMS to return to, if the LMS sent one
  returnUrl: string | null
  // Unix time in seconds
  expiresAt: number
}

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

// Splits the token off a URL fragment. Returns the fragment without the token, so other fragment parameters stay.
export const extractToken = (hash: string): { token: string | null; remainingHash: string } => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const token = params.get(TOKEN_FRAGMENT_PARAM)
  params.delete(TOKEN_FRAGMENT_PARAM)
  const remaining = params.toString()
  return { token: token === '' ? null : token, remainingHash: remaining === '' ? '' : `#${remaining}` }
}

type BrowserLocation = Pick<Location, 'hash' | 'pathname' | 'search'>
type BrowserHistory = Pick<History, 'replaceState' | 'state'>

// Moves a token from the URL into the storage and removes it from the address bar, so it is not shared, bookmarked
// or kept in the history (NFR-09). Runs before the app starts, so navigation never sees the token.
export const takeTokenFromUrl = (
  location: BrowserLocation,
  history: BrowserHistory,
  storage: KeyValueStorage,
): void => {
  const { token, remainingHash } = extractToken(location.hash)
  if (token === null) {
    return
  }
  storage.setItem(TOKEN_STORAGE_KEY, token)
  history.replaceState(history.state, '', `${location.pathname}${location.search}${remainingHash}`)
}

export const getStoredToken = (storage: KeyValueStorage): string | null => storage.getItem(TOKEN_STORAGE_KEY)

export type LtiSessionResult = { type: 'active'; session: LtiSession } | { type: 'expired' } | { type: 'error' }

const isLtiSession = (value: unknown): value is LtiSession => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { jobId, unitId, returnUrl, expiresAt } = value as Record<string, unknown>
  return (
    typeof jobId === 'number' &&
    typeof unitId === 'number' &&
    (typeof returnUrl === 'string' || returnUrl === null) &&
    typeof expiresAt === 'number'
  )
}

// Asks lunes-lti (same origin, below /lti) for the launch the token belongs to.
export const loadLtiSession = async (token: string, fetchFunction: typeof fetch = fetch): Promise<LtiSessionResult> => {
  try {
    const response = await fetchFunction(`${WEB_BASE_PATH}/lti/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (response.status === HTTP_UNAUTHORIZED) {
      return { type: 'expired' }
    }
    if (!response.ok) {
      return { type: 'error' }
    }
    const body: unknown = await response.json()
    return isLtiSession(body) ? { type: 'active', session: body } : { type: 'error' }
  } catch {
    return { type: 'error' }
  }
}
