import { mocked } from 'jest-mock'
import React from 'react'

import { getLabels } from '../../../../services/helpers'
import { canShare } from '../../../../services/share'
import render from '../../../../testing/render'
import ShareSection from '../ShareSection'

jest.mock('../../../../services/share', () => ({
  canShare: jest.fn(() => true),
  shareText: jest.fn(),
}))

describe('ShareSection', () => {
  it('should show the share button', () => {
    const { getByText } = render(<ShareSection unitTitle='My Unit' results={[]} />)

    expect(getByText(getLabels().results.share.button)).toBeDefined()
  })

  it('should be hidden if sharing is not possible', () => {
    mocked(canShare).mockReturnValueOnce(false)

    const { queryByText } = render(<ShareSection unitTitle='My Unit' results={[]} />)

    expect(queryByText(getLabels().results.share.description)).toBeNull()
  })
})
