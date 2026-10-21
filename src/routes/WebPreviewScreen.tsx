import React, { ReactElement, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components/native'

import Title from '../components/Title'
import { ContentSecondary } from '../components/text/Content'
import { SubheadingText } from '../components/text/Subheading'
import theme from '../constants/theme'

// Temporary screen for step 1 of the web version (docs/web/README.md). Replaced by App in step 4.

const Root = styled.View`
  flex: 1;
  align-items: center;
  padding: ${props => props.theme.spacings.md};
  background-color: ${props => props.theme.colors.background};
`

const CounterButton = styled.Pressable`
  padding: ${props => props.theme.spacings.sm};
  border-radius: 56px;
  background-color: ${props => props.theme.colors.primary};
`

const CounterLabel = styled(SubheadingText)`
  color: ${props => props.theme.colors.background};
`

const WebPreviewScreen = (): ReactElement => {
  const [count, setCount] = useState<number>(0)

  return (
    <ThemeProvider theme={theme}>
      <Root>
        <Title title='Lunes' subtitle='Web preview' description='react-native-web with Webpack' />
        <CounterButton onPress={() => setCount(count + 1)} accessibilityRole='button'>
          <CounterLabel>Pressed {count} times</CounterLabel>
        </CounterButton>
        <ContentSecondary>Theme, styled-components and text components render on web.</ContentSecondary>
      </Root>
    </ThemeProvider>
  )
}

export default WebPreviewScreen
