import React, { ReactElement, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components/native'

import { CloseIconRed, HeartIcon, MenuIcon } from '../../assets/images'
import Button from '../components/Button'
import Title from '../components/Title'
import { ContentSecondary } from '../components/text/Content'
import { BUTTONS_THEME } from '../constants/data'
import theme from '../constants/theme'

// Temporary screen for the first steps of the web version (docs/web/README.md). Replaced by App in step 4.

const Root = styled.View`
  flex: 1;
  align-items: center;
  padding: ${props => props.theme.spacings.md};
  background-color: ${props => props.theme.colors.background};
`

const IconRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => props.theme.spacings.sm};
`

// Wrapped icons receive their style as an array, like MenuIconWhite in HomeScreenHeader
const StyledMenuIcon = styled(MenuIcon)`
  margin: 0 ${props => props.theme.spacings.xs};
`

const WebPreviewScreen = (): ReactElement => {
  const [count, setCount] = useState<number>(0)

  return (
    <ThemeProvider theme={theme}>
      <Root>
        <Title title='Lunes' subtitle='Web preview' description='react-native-web with Webpack' />
        <IconRow>
          <HeartIcon color={theme.colors.primary} width={32} height={32} testID='heart-primary' />
          <HeartIcon color={theme.colors.incorrect} width={32} height={32} testID='heart-incorrect' />
          <StyledMenuIcon color={theme.colors.correct} width={32} height={32} testID='menu-styled' />
          <CloseIconRed width={32} height={32} testID='close-red' />
        </IconRow>
        <Button
          label={`Pressed ${count} times`}
          onPress={() => setCount(count + 1)}
          buttonTheme={BUTTONS_THEME.contained}
          iconLeft={HeartIcon}
        />
        <ContentSecondary>Theme, fonts, SVG icons and Button render on web.</ContentSecondary>
      </Root>
    </ThemeProvider>
  )
}

export default WebPreviewScreen
