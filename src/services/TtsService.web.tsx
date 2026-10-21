import React, { ReactElement } from 'react'

import type { TtsServiceProviderProps, TtsState } from './TtsService'

// Text-to-speech on web follows in step 5 with easy-speech (docs/web/0004-audio-and-tts.md).
// Until then TTS stays uninitialized, so the native TTS module is not loaded in the browser.

export type { TtsServiceProviderProps, TtsState }

export const TtsServiceContext = React.createContext<TtsState>('uninitialized')

const TtsServiceProvider = ({ children }: TtsServiceProviderProps): ReactElement => (
  <TtsServiceContext.Provider value='uninitialized'>{children}</TtsServiceContext.Provider>
)

export default TtsServiceProvider
