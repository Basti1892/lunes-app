import React, { createContext, ReactElement } from 'react'

import type { VolumeServiceProviderProps, VolumeState } from './VolumeService'

// Browsers do not expose the device volume or a silent switch (docs/web/0004-audio-and-tts.md).
// Audio is therefore never disabled because of the volume on web.

export type { VolumeServiceProviderProps, VolumeState }

const audibleVolumeState: VolumeState = { volume: 1, isSilentSwitchActive: false }

export const VolumeServiceContext = createContext<VolumeState>(audibleVolumeState)

const VolumeServiceProvider = ({ children }: VolumeServiceProviderProps): ReactElement => (
  <VolumeServiceContext.Provider value={audibleVolumeState}>{children}</VolumeServiceContext.Provider>
)

export default VolumeServiceProvider
