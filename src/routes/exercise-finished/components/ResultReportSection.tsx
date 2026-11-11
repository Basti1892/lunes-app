import React, { ReactElement } from 'react'
import styled from 'styled-components/native'

import { getLabels } from '../../../services/helpers'
import type { ResultReport } from '../../../services/ltiSession'

const Message = styled.Text<{ isProblem: boolean }>`
  text-align: center;
  margin: ${props => props.theme.spacings.md} ${props => props.theme.spacings.xl} ${props => props.theme.spacings.sm};
  color: ${props => (props.isProblem ? props.theme.colors.incorrect : props.theme.colors.textSecondary)};
  font-family: ${props => props.theme.fonts.contentFontRegular};
  font-size: ${props => props.theme.fonts.defaultFontSize};
`

type ResultReportSectionProps = {
  report: ResultReport
}

// Tells the learner whether the result reached the LMS gradebook after an LTI launch (docs/web/0015-embedded-mode.md,
// docs/web/0016-grade-passback.md). Renders nothing without a launch, so the apps never show it.
const ResultReportSection = ({ report }: ResultReportSectionProps): ReactElement | null => {
  if (report.type === 'none') {
    return null
  }
  const isProblem = report.type === 'expired' || report.type === 'error'
  return (
    <Message isProblem={isProblem} accessibilityLiveRegion='polite' testID='result-report'>
      {getLabels().results.lms[report.type]}
    </Message>
  )
}

export default ResultReportSection
