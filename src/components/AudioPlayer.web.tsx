import React from 'react'
import styled, { useTheme } from 'styled-components/native'

import { VolumeUpCircleIcon } from '../../assets/images'
import type NativeAudioPlayer from './AudioPlayer'

// Placeholder until audio is implemented for web in step 5 (docs/web/0004-audio-and-tts.md).
// The native AudioPlayer cannot be bundled, because react-native-sound-player and react-native-tts are native only.

const DisabledVolumeIcon = styled.View`
  width: ${props => props.theme.spacings.lg};
  height: ${props => props.theme.spacings.lg};
  border-radius: 50px;
  background-color: ${props => props.theme.colors.disabled};
  justify-content: center;
  align-items: center;
`

const AudioPlayer: typeof NativeAudioPlayer = () => {
  const theme = useTheme()
  return (
    <DisabledVolumeIcon testID='audio-player' accessibilityRole='button' aria-disabled>
      <VolumeUpCircleIcon
        width={theme.spacingsPlain.md}
        height={theme.spacingsPlain.md}
        color={theme.colors.background}
      />
    </DisabledVolumeIcon>
  )
}

export default AudioPlayer
