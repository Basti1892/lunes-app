import React, { ReactElement, useState } from 'react'
import styled, { useTheme } from 'styled-components/native'

import {
  ArrowLeftCircleFilledIcon,
  ArrowLeftCircleOutlineIcon,
  CloseCircleFilledIcon,
  CloseCircleOutlineIcon,
} from '../../assets/images'
import { NavigationTitle } from './NavigationTitle'

const Container = styled.Pressable`
  padding-left: ${props => props.theme.spacings.sm};
  flex-direction: row;
  align-items: center;
`

// The icon is replaced while pressed. Presses must therefore never target the icon itself: on web, the browser does
// not dispatch a click if the element under the pointer is removed between mouse down and mouse up.
const IconContainer = styled.View`
  pointer-events: none;
`

type NavigationHeaderLeftProps = {
  title: string
  onPress: () => void
  isCloseButton: boolean
}

const NavigationHeaderLeft = ({ onPress, title, isCloseButton }: NavigationHeaderLeftProps): ReactElement => {
  const theme = useTheme()
  const [pressed, setPressed] = useState<boolean>(false)

  const outlineIcon = isCloseButton ? CloseCircleOutlineIcon : ArrowLeftCircleOutlineIcon
  const filledIcon = isCloseButton ? CloseCircleFilledIcon : ArrowLeftCircleFilledIcon
  const Icon = pressed ? filledIcon : outlineIcon

  return (
    <Container onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
      <IconContainer>
        <Icon width={theme.sizes.defaultIcon} height={theme.sizes.defaultIcon} />
      </IconContainer>
      <NavigationTitle numberOfLines={2}>{title}</NavigationTitle>
    </Container>
  )
}

export default NavigationHeaderLeft
