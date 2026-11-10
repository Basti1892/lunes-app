import React, { ReactElement, useEffect, useState } from 'react'

import type { EmbeddedModeProviderProps } from './EmbeddedModeService'
import { EmbeddedModeContext, useEmbeddedMode } from './embeddedModeContext'
import type { EmbeddedMode } from './embeddedModeContext'
import { getStoredToken, loadLtiSession } from './ltiSession'

export type { EmbeddedMode, EmbeddedModeProviderProps }
export { EmbeddedModeContext, useEmbeddedMode }

// The token was moved from the URL into the sessionStorage by index.web.js before the app started. The
// sessionStorage belongs to the tab (and, in an iframe, to the LMS site), so a reload keeps the embedded mode, while a
// new tab with the plain app is standalone (NFR-11).
const readToken = (): string | null => {
  try {
    return getStoredToken(window.sessionStorage)
  } catch {
    // Storage blocked by the browser
    return null
  }
}

const EmbeddedModeProvider = ({ children }: EmbeddedModeProviderProps): ReactElement => {
  const [token] = useState(readToken)
  const [mode, setMode] = useState<EmbeddedMode>(token === null ? { type: 'standalone' } : { type: 'loading' })

  useEffect(() => {
    if (token === null) {
      return () => undefined
    }
    let cancelled = false
    loadLtiSession(token)
      .then(result => {
        if (!cancelled) {
          setMode(result)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMode({ type: 'error' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return <EmbeddedModeContext.Provider value={mode}>{children}</EmbeddedModeContext.Provider>
}

export default EmbeddedModeProvider
