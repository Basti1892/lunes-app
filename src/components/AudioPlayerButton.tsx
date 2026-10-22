import React, { ReactElement } from 'react'
import { Tooltip } from 'react-native-paper'
import styled, { useTheme } from 'styled-components/native'

import { VolumeDisabled, VolumeUpCircleIcon } from '../../assets/images'
import { useIsSilent } from '../hooks/useVolumeState'
import { getLabels } from '../services/helpers'
import PressableOpacity from './PressableOpacity'

// Button of AudioPlayer, shared by the native and the web implementation (AudioPlayer.web.tsx)

const VolumeIcon = styled(PressableOpacity)<{ disabled: boolean; isActive: boolean }>`
  width: ${props => props.theme.spacings.lg};
  height: ${props => props.theme.spacings.lg};
  border-radius: 50px;
  background-color: ${props => {
    if (props.disabled) {
      return props.theme.colors.disabled
    }
    if (props.isActive) {
      return props.theme.colors.audioIconSelected
    }
    return props.theme.colors.audioIconHighlight
  }};
  justify-content: center;
  align-items: center;
  shadow-color: ${props => props.theme.colors.shadow};
  elevation: 8;
  shadow-radius: 5px;
  shadow-offset: 1px 1px;
  shadow-opacity: 0.5;
`

const Icon = (): ReactElement => {
  const theme = useTheme()
  const isSilent = useIsSilent()

  if (isSilent) {
    return (
      <Tooltip enterTouchDelay={0} title={getLabels().general.error.deviceIsMuted} leaveTouchDelay={2600}>
        <VolumeDisabled width={theme.spacingsPlain.md} height={theme.spacingsPlain.md} color={theme.colors.black} />
      </Tooltip>
    )
  }

  return (
    <VolumeUpCircleIcon
      width={theme.spacingsPlain.md}
      height={theme.spacingsPlain.md}
      color={theme.colors.background}
    />
  )
}

type AudioPlayerButtonProps = {
  disabled: boolean
  isActive: boolean
  onPress: () => void
}

const AudioPlayerButton = ({ disabled, isActive, onPress }: AudioPlayerButtonProps): ReactElement => (
  <VolumeIcon disabled={disabled} isActive={isActive} onPress={onPress} testID='audio-player'>
    <Icon />
  </VolumeIcon>
)

export default AudioPlayerButton
