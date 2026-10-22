// Focus styles of CustomTextInput. In the apps the focus is shown by the border color of the field.
// On web, the browser also draws its focus ring, but only around the inner input; textInputFocus.web.ts moves the ring
// to the whole field.
export const inputFocusCss: () => string = () => ''

export const fieldFocusCss: (isFocused: boolean, color: string) => string = () => ''
