import React, { ReactElement } from 'react'
import styled from 'styled-components/native'

import { useEmbeddedMode } from '../services/EmbeddedModeService'
import { getLabels } from '../services/helpers'

const Container = styled.View`
  background-color: ${props => props.theme.colors.backgroundRed};
  padding: ${props => props.theme.spacings.xs} ${props => props.theme.spacings.sm};
`

const Message = styled.Text`
  text-align: center;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.contentFontRegular};
  font-size: ${props => props.theme.fonts.defaultFontSize};
`

// Tells the learner after an LTI launch that results cannot reach the LMS, because the session has expired or
// lunes-lti cannot be reached (FR-11, docs/web/0015-embedded-mode.md). Lunes keeps working with the normal navigation.
// Renders nothing in the other states, so the apps (always standalone) never show it.
const EmbeddedModeNotice = (): ReactElement | null => {
  const embeddedMode = useEmbeddedMode()
  if (embeddedMode.type !== 'expired' && embeddedMode.type !== 'error') {
    return null
  }
  return (
    <Container accessibilityRole='alert' testID='embedded-mode-notice'>
      <Message>{getLabels().embeddedMode[embeddedMode.type]}</Message>
    </Container>
  )
}

export default EmbeddedModeNotice
