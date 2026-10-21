import { versionName } from '../../version.json'

export const getVersion = (): string => versionName

export const isEmulatorSync = (): boolean => false

// Only used for the tab bar label padding, which is not shown on web
export const isTablet = (): boolean => false
