import type * as NativeHardwareBackPress from './hardwareBackPress'

// There is no hardware back button on web. The back button of the browser is handled by React Navigation
// (docs/web/0008). react-native-web logs an error for every use of BackHandler, so it is not used here.
export const addHardwareBackPressListener: typeof NativeHardwareBackPress.addHardwareBackPressListener = () => () =>
  undefined
