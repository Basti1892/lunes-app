import * as Sentry from '@sentry/react'
import { mocked } from 'jest-mock'

import { getStorageItem } from '../Storage'

jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  isInitialized: jest.fn(() => false),
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}))
jest.mock('../Storage', () => ({ getStorageItem: jest.fn() }))
jest.mock('../deviceInfo', () => ({ getVersion: () => '2026.9.1' }))

type SentryWeb = typeof import('../sentry.web')

// __DEV__ is a global of React Native, read by sentry.web when it is loaded
const setDev = (dev: boolean): void => {
  Object.defineProperty(globalThis, '__DEV__', { value: dev, configurable: true, writable: true })
}

const loadSentry = ({ dev, dsn }: { dev: boolean; dsn?: string }): SentryWeb => {
  setDev(dev)
  if (dsn === undefined) {
    delete process.env.LUNES_SENTRY_DSN
  } else {
    process.env.LUNES_SENTRY_DSN = dsn
  }
  let sentry: SentryWeb | undefined
  jest.isolateModules(() => {
    sentry = jest.requireActual<SentryWeb>('../sentry.web')
  })
  return sentry!
}

const flushPromises = (): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, 0)
  })

describe('sentry (web)', () => {
  const dsn = 'https://key@sentry.example.org/1'

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterAll(() => {
    setDev(true)
    delete process.env.LUNES_SENTRY_DSN
  })

  it('should not send anything in development', async () => {
    const { initSentry, reportError } = loadSentry({ dev: true, dsn })

    initSentry()
    reportError(new Error('error'))
    await flushPromises()

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('should not send anything without a DSN', async () => {
    mocked(getStorageItem).mockResolvedValue({ consentGiven: true, consentDate: '2026-01-01' })
    const { initSentry, reportError } = loadSentry({ dev: false })

    initSentry()
    reportError(new Error('error'))
    await flushPromises()

    expect(Sentry.init).not.toHaveBeenCalled()
    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('should initialize Sentry with the DSN in production', () => {
    const { initSentry } = loadSentry({ dev: false, dsn })

    initSentry()

    expect(Sentry.init).toHaveBeenCalledWith({
      dsn,
      release: 'lunes-web@2026.9.1',
      initialScope: { tags: { platform: 'web' } },
      beforeSend: expect.any(Function),
      integrations: expect.any(Function),
    })
  })

  it('should report errors in production', () => {
    const { reportError } = loadSentry({ dev: false, dsn })
    const error = new Error('error')

    reportError(error)

    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('should send events only with analytics consent', async () => {
    const { sendOnlyWithConsent } = loadSentry({ dev: false, dsn })
    const event = { type: undefined, message: 'error' }

    mocked(getStorageItem).mockResolvedValueOnce(null)
    await expect(sendOnlyWithConsent(event)).resolves.toBeNull()

    mocked(getStorageItem).mockResolvedValueOnce({ consentGiven: false, consentDate: '2026-01-01' })
    await expect(sendOnlyWithConsent(event)).resolves.toBeNull()

    mocked(getStorageItem).mockResolvedValueOnce({ consentGiven: true, consentDate: '2026-01-01' })
    await expect(sendOnlyWithConsent(event)).resolves.toBe(event)
  })

  it('should not track sessions', () => {
    const { withoutSessionTracking } = loadSentry({ dev: false, dsn })
    const integration = (name: string) => ({ name })

    expect(withoutSessionTracking([integration('GlobalHandlers'), integration('BrowserSession')])).toEqual([
      integration('GlobalHandlers'),
    ])
  })
})
