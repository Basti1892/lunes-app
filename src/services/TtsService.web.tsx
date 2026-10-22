import EasySpeech from 'easy-speech'
import React, { ReactElement, useEffect, useState } from 'react'

import type { TtsServiceProviderProps, TtsState } from './TtsService'
import { reportError } from './sentry'

// Text-to-speech on web uses the Web Speech API through easy-speech (docs/web/0004-audio-and-tts.md).
// Without a German voice TTS stays in the error state and the audio button for TTS texts is disabled.

export type { TtsServiceProviderProps, TtsState }

export const TtsServiceContext = React.createContext<TtsState>('uninitialized')

const GERMAN = 'de-DE'
const INIT_TIMEOUT_MS = 5000
const INIT_INTERVAL_MS = 250

const normalizeLanguage = (language: string): string => language.replace('_', '-').toLowerCase()

// Prefers a voice for de-DE, falls back to any other German voice (e.g. de-AT, de-CH)
export const findGermanVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined =>
  voices.find(voice => normalizeLanguage(voice.lang) === normalizeLanguage(GERMAN)) ??
  voices.find(voice => normalizeLanguage(voice.lang).startsWith('de'))

export const initTts = async (): Promise<TtsState> => {
  if (EasySpeech.status().status !== 'init: complete') {
    await EasySpeech.init({ maxTimeout: INIT_TIMEOUT_MS, interval: INIT_INTERVAL_MS, quiet: true })
  }
  const voice = findGermanVoice(EasySpeech.voices())
  if (voice === undefined) {
    return 'error'
  }
  EasySpeech.defaults({ voice })
  return 'initialized'
}

const TtsServiceProvider = ({ children }: TtsServiceProviderProps): ReactElement => {
  const [state, setState] = useState<TtsState>('uninitialized')

  useEffect(() => {
    initTts()
      .then(setState)
      .catch((error: unknown) => {
        reportError(error)
        setState('error')
      })
  }, [])

  return <TtsServiceContext.Provider value={state}>{children}</TtsServiceContext.Provider>
}

export default TtsServiceProvider
