import React from 'react'

import { EmbeddedMode, EmbeddedModeContext } from '../../services/EmbeddedModeService'
import { getLabels } from '../../services/helpers'
import render from '../../testing/render'
import EmbeddedModeNotice from '../EmbeddedModeNotice'

const renderNotice = (embeddedMode: EmbeddedMode) =>
  render(
    <EmbeddedModeContext.Provider value={embeddedMode}>
      <EmbeddedModeNotice />
    </EmbeddedModeContext.Provider>,
  )

describe('EmbeddedModeNotice', () => {
  it.each<EmbeddedMode>([
    { type: 'standalone' },
    { type: 'loading' },
    { type: 'active', session: { jobId: 1, unitId: 2, returnUrl: null, expiresAt: 1 } },
  ])('should show nothing in the state $type', embeddedMode => {
    const { queryByTestId } = renderNotice(embeddedMode)

    expect(queryByTestId('embedded-mode-notice')).toBeNull()
  })

  it('should tell that the session has expired', () => {
    const { getByText } = renderNotice({ type: 'expired' })

    expect(getByText(getLabels().embeddedMode.expired)).toBeDefined()
  })

  it('should tell that the course cannot be reached', () => {
    const { getByText } = renderNotice({ type: 'error' })

    expect(getByText(getLabels().embeddedMode.error)).toBeDefined()
  })
})
