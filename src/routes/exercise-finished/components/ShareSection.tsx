import React, { ReactElement } from 'react'
import styled from 'styled-components/native'

import { VocabularyItemResult } from '../../../navigation/NavigationTypes'
import { useEmbeddedMode } from '../../../services/EmbeddedModeService'
import { getLabels } from '../../../services/helpers'
import { canShare } from '../../../services/share'
import ShareButton from './ShareButton'

const Container = styled.View`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.spacings.md};
  padding: ${props => props.theme.spacings.sm};
  border-radius: 6px;
  shadow-color: ${props => props.theme.colors.shadow};
  shadow-offset: 0px 6px;
  shadow-opacity: 0.2;
  shadow-radius: 6px;
  elevation: 10;
  background-color: ${props => props.theme.colors.backgroundAccent};
`

const Description = styled.Text`
  font-family: ${props => props.theme.fonts.contentFontBold};
  font-size: ${props => props.theme.fonts.largeFontSize};
  text-align: center;
  padding-bottom: ${props => props.theme.spacings.sm};
`

type ShareSectionProps = {
  unitTitle: string
  results: VocabularyItemResult[]
}

const ShareSection = ({ unitTitle, results }: ShareSectionProps): ReactElement | null => {
  // Not offered when launched from an LMS course: learners share their results in school, not with friends
  // (docs/web/0015-embedded-mode.md). The apps are always standalone.
  const embeddedMode = useEmbeddedMode()
  if (!canShare() || embeddedMode.type !== 'standalone') {
    return null
  }
  return (
    <Container>
      <Description>{getLabels().results.share.description}</Description>
      <ShareButton unitTitle={unitTitle} results={results} />
    </Container>
  )
}

export default ShareSection
