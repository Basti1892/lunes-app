import React from 'react'

import { getLabels } from '../../../../services/helpers'
import { ResultReport } from '../../../../services/ltiSession'
import render from '../../../../testing/render'
import ResultReportSection from '../ResultReportSection'

describe('ResultReportSection', () => {
  it('should show nothing without an LTI launch', () => {
    const { queryByTestId } = render(<ResultReportSection report={{ type: 'none' }} />)

    expect(queryByTestId('result-report')).toBeNull()
  })

  it.each<ResultReport['type'] & keyof ReturnType<typeof getLabels>['results']['lms']>([
    'sending',
    'submitted',
    'notGraded',
    'preview',
    'expired',
    'error',
  ])('should show the state %s', type => {
    const { getByText } = render(<ResultReportSection report={{ type }} />)

    expect(getByText(getLabels().results.lms[type])).toBeDefined()
  })
})
