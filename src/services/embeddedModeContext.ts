import { createContext, useContext } from 'react'

import type { LtiSession } from './ltiSession'

// Embedded mode: the app was launched from an LMS course via LTI (docs/web/0015-embedded-mode.md).
// Shared by EmbeddedModeService.tsx and EmbeddedModeService.web.tsx. It lives in its own module without a .web
// sibling, because an import of './EmbeddedModeService' inside the .web file would resolve to the .web file itself.

export type EmbeddedMode =
  | { type: 'standalone' }
  | { type: 'loading' }
  | { type: 'active'; session: LtiSession }
  // The session token expired or is unknown: the activity has to be started again from the LMS (FR-11)
  | { type: 'expired' }
  // lunes-lti could not be reached
  | { type: 'error' }

export const EmbeddedModeContext = createContext<EmbeddedMode>({ type: 'standalone' })

export const useEmbeddedMode = (): EmbeddedMode => useContext(EmbeddedModeContext)
