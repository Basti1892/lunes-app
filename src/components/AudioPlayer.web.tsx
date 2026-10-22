import EasySpeech from 'easy-speech'
import React, { ComponentProps, ReactElement, useEffect, useRef, useState } from 'react'

import useTtsState from '../hooks/useTtsState'
import { reportError } from '../services/sentry'
import type NativeAudioPlayer from './AudioPlayer'
import AudioPlayerButton from './AudioPlayerButton'

// Plays audio files with an HTML audio element and texts with the Web Speech API (docs/web/0004-audio-and-tts.md).
// Browsers only allow playback after a user interaction, which is always the case here (press on the button).

const AudioPlayer = ({
  audio,
  disabled,
  isTtsText = false,
}: ComponentProps<typeof NativeAudioPlayer>): ReactElement => {
  const ttsInitialized = useTtsState() === 'initialized'
  const [isActive, setIsActive] = useState(false)
  const audioElement = useRef<HTMLAudioElement | null>(null)

  // Stop playback if the audio changes or the player is removed, e.g. when navigating to the next word
  useEffect(
    () => () => {
      audioElement.current?.pause()
      audioElement.current = null
      if (isTtsText) {
        EasySpeech.cancel()
      }
      setIsActive(false)
    },
    [audio, isTtsText],
  )

  const onFinished = (): void => setIsActive(false)

  const onError = (error: unknown): void => {
    reportError(error)
    setIsActive(false)
  }

  const playAudio = (): void => {
    audioElement.current?.pause()
    const element = new Audio(audio)
    element.addEventListener('ended', onFinished)
    element.addEventListener('error', () => onError(element.error))
    audioElement.current = element
    element.play().catch(onError)
  }

  const speakText = (): void => {
    EasySpeech.speak({ text: audio }).then(onFinished).catch(onError)
  }

  const handleSpeakerClick = (): void => {
    setIsActive(true)
    if (isTtsText) {
      speakText()
    } else {
      playAudio()
    }
  }

  return (
    <AudioPlayerButton
      disabled={disabled || (isTtsText && !ttsInitialized)}
      isActive={isActive}
      onPress={handleSpeakerClick}
    />
  )
}

export default AudioPlayer
