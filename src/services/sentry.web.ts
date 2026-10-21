/* eslint-disable no-console */
import type { SeverityLevel } from '@sentry/react-native'

// Error reporting is not set up on web yet (docs/web/0011). In development, messages go to the console as on native.

export const initSentry = (): void => undefined

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
  }
}

export const reportError = (err: unknown): void => {
  if (__DEV__) {
    console.error('Sentry reported error: ', err)
  }
}
