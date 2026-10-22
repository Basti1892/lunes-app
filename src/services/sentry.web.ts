/* eslint-disable no-console */
import * as Sentry from '@sentry/react'
import type { ErrorEvent, SeverityLevel } from '@sentry/react'

import { getStorageItem } from './Storage'
import { getVersion } from './deviceInfo'

// Error reporting of the web version (docs/web/0011-error-reporting-web.md). Like in the apps, it is only active in
// production builds and errors are only sent with analytics consent. In addition, the DSN has to be set with
// LUNES_SENTRY_DSN when building, otherwise nothing is sent.
const SENTRY_DSN: string = process.env.LUNES_SENTRY_DSN ?? ''

type Integration = ReturnType<typeof Sentry.getDefaultIntegrations>[number]

const isSentryEnabled = (): boolean => !__DEV__ && SENTRY_DSN !== ''

// Applies to every event, also to errors Sentry captures by itself (e.g. uncaught exceptions)
export const sendOnlyWithConsent = async (event: ErrorEvent): Promise<ErrorEvent | null> => {
  const analyticsConsent = await getStorageItem('analyticsConsent')
  return analyticsConsent?.consentGiven ? event : null
}

// Session tracking would contact Sentry on every page load, also without consent
export const withoutSessionTracking = (integrations: Integration[]): Integration[] =>
  integrations.filter(({ name }) => name !== 'BrowserSession')

export const initSentry = (): void => {
  if (isSentryEnabled() && !Sentry.isInitialized()) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: `lunes-web@${getVersion()}`,
      initialScope: { tags: { platform: 'web' } },
      beforeSend: sendOnlyWithConsent,
      integrations: withoutSessionTracking,
    })
  }
}

export const log = (message: string, level: SeverityLevel = 'debug'): void => {
  if (__DEV__) {
    switch (level) {
      case 'fatal':
      case 'error':
        console.error(message)
        break
      case 'warning':
        console.warn(message)
        break
      case 'log':
        console.log(message)
        break
      case 'info':
        console.info(message)
        break
      case 'debug':
        console.debug(message)
        break
    }
  } else if (isSentryEnabled()) {
    Sentry.addBreadcrumb({ message, level })
  }
}

export const reportError = (err: unknown): void => {
  if (__DEV__) {
    console.error('Sentry reported error: ', err)
  } else if (isSentryEnabled()) {
    // The consent is checked in sendOnlyWithConsent
    Sentry.captureException(err)
  }
}
