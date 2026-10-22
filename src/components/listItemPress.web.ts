import type * as NativeListItemPress from './listItemPress'

// react-native-web delays the press in by 50 ms. If the pointer is released earlier (a fast click), it only calls
// onPressIn and onPressOut if the Pressable has an onPress. ListItem handles the press itself in onPressOut.
export const onPressForShortPresses: typeof NativeListItemPress.onPressForShortPresses = () => undefined
