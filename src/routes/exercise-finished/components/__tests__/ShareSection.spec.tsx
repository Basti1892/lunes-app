import { mocked } from 'jest-mock'
import React from 'react'

import { EmbeddedModeContext } from '../../../../services/EmbeddedModeService'
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

  it('should be hidden after an LTI launch', () => {
    const { queryByText } = render(
      <EmbeddedModeContext.Provider
        value={{ type: 'active', session: { jobId: 1, unitId: 2, returnUrl: null, expiresAt: 1 } }}
      >
        <ShareSection unitTitle='My Unit' results={[]} />
      </EmbeddedModeContext.Provider>,
    )

    expect(queryByText(getLabels().results.share.description)).toBeNull()
  })
})
