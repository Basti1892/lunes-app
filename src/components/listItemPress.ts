// ListItem handles its presses in onPressOut and does not need onPress in the apps.
// react-native-web needs one for fast clicks, see listItemPress.web.ts.
export const onPressForShortPresses: (() => void) | undefined = undefined
