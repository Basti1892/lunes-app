import type * as NativeTextInputFocus from './textInputFocus'

// The inner input has no focus ring of its own, the whole field gets it instead (keeps the focus visible for keyboard
// users, but with the width of the field). The ring is drawn inside the field, so that it is also visible on the dark
// background of the first job selection.
export const inputFocusCss: typeof NativeTextInputFocus.inputFocusCss = () => 'outline-style: none;'

export const fieldFocusCss: typeof NativeTextInputFocus.fieldFocusCss = (isFocused, color) =>
  isFocused ? `outline-style: solid; outline-width: 2px; outline-color: ${color}; outline-offset: -2px;` : ''
