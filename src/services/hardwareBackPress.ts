import { BackHandler } from 'react-native'

// Listens to the hardware back button (Android). Replaced by hardwareBackPress.web.ts on web (docs/web/0002).
// The handler returns true if it handled the back press. Returns a function that removes the listener.
export const addHardwareBackPressListener = (handler: () => boolean): (() => void) =>
  BackHandler.addEventListener('hardwareBackPress', handler).remove
