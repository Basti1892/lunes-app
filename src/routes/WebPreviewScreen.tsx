import React, { ReactElement, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components/native'

import { CloseIconRed, HeartIcon, MenuIcon } from '../../assets/images'
import Button from '../components/Button'
import Title from '../components/Title'
import { ContentSecondary } from '../components/text/Content'
import { BUTTONS_THEME } from '../constants/data'
import theme from '../constants/theme'
import useLoadAllJobs from '../hooks/useLoadAllJobs'
import StorageProvider from '../services/Storage'

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

const MAX_PREVIEW_JOBS = 3

// Loads the professions from the CMS through the dev server proxy, using the storage of the app
const JobsPreview = (): ReactElement => {
  const { data: jobs, error, loading } = useLoadAllJobs()

  if (loading) {
    return <ContentSecondary>Loading professions…</ContentSecondary>
  }
  if (error !== null || jobs === null) {
    return <ContentSecondary testID='jobs-error'>Loading professions failed: {error?.message}</ContentSecondary>
  }
  const names = jobs
    .slice(0, MAX_PREVIEW_JOBS)
    .map(job => job.name)
    .join(', ')
  return (
    <ContentSecondary testID='jobs'>
      {jobs.length} professions loaded, e.g. {names}
    </ContentSecondary>
  )
}

const WebPreviewScreen = (): ReactElement => {
  const [count, setCount] = useState<number>(0)

  return (
    <ThemeProvider theme={theme}>
      <StorageProvider>
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
          <JobsPreview />
        </Root>
      </StorageProvider>
    </ThemeProvider>
  )
}

export default WebPreviewScreen
