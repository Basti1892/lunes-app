import React, { ReactElement, useEffect, useState } from 'react'
import { ToastAndroid } from 'react-native'
import SoundPlayer from 'react-native-sound-player'
import Tts, { Options } from 'react-native-tts'

import useTtsState from '../hooks/useTtsState'
import { useIsSilent } from '../hooks/useVolumeState'
import { getLabels } from '../services/helpers'
import AudioPlayerButton from './AudioPlayerButton'

type AudioPlayerProps = {
  disabled: boolean
  audio: string
  isTtsText?: boolean
}

const AudioPlayer = ({ audio, disabled, isTtsText = false }: AudioPlayerProps): ReactElement => {
  const ttsInitialized = useTtsState() === 'initialized'
  const [soundPlayerInitialized, setSoundPlayerInitialized] = useState<boolean>(false)
  const [isActive, setIsActive] = useState(false)
  const isSilent = useIsSilent()

  useEffect(() => {
    if (disabled) {
      return () => undefined
    }
    if (isTtsText) {
      return Tts.addListener('tts-finish', () => setIsActive(false)).remove
    }

    const onFinishedLoadingSubscription = SoundPlayer.addEventListener('FinishedLoadingURL', () => {
      SoundPlayer.play()
    })
    const onSoundPlayerFinishPlaying = SoundPlayer.addEventListener('FinishedPlaying', () => setIsActive(false))
    setSoundPlayerInitialized(true)

    return () => {
      onFinishedLoadingSubscription.remove()
      onSoundPlayerFinishPlaying.remove()
    }
  }, [disabled, isTtsText, audio])

  const handleSpeakerClick = (): void => {
    if (isTtsText) {
      if (ttsInitialized) {
        setIsActive(true)
        // @ts-expect-error ios params should be optional
        const options: Options = {
          androidParams: {
            KEY_PARAM_PAN: 0,
            KEY_PARAM_VOLUME: 0.5,
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
          },
        }
        Tts.speak(audio, options)
      } else {
        Tts.requestInstallEngine().catch(() => {
          /* eslint-disable-next-line no-console */
          console.error('Could not install tts engine')
          ToastAndroid.show(getLabels().general.audio.noTtsEngine, ToastAndroid.SHORT)
        })
      }
    } else if (soundPlayerInitialized) {
      setIsActive(true)
      SoundPlayer.loadUrl(audio)
    }
  }

  return (
    <AudioPlayerButton
      disabled={disabled || (!isTtsText && !soundPlayerInitialized) || isSilent}
      isActive={isActive}
      onPress={handleSpeakerClick}
    />
  )
}

export default AudioPlayer
