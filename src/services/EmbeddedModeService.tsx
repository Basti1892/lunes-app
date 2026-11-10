import { ReactElement } from 'react'

import { EmbeddedModeContext, useEmbeddedMode } from './embeddedModeContext'
import type { EmbeddedMode } from './embeddedModeContext'

// Only the web version can be launched via LTI (EmbeddedModeService.web.tsx); the apps are always standalone.

export type { EmbeddedMode }
export { EmbeddedModeContext, useEmbeddedMode }

export type EmbeddedModeProviderProps = {
  children: ReactElement
}

const EmbeddedModeProvider = ({ children }: EmbeddedModeProviderProps): ReactElement => children

export default EmbeddedModeProvider
