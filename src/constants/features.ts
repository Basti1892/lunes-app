// Features that can be switched off per platform. features.web.ts hides the ones without a web version
// (docs/web/0003-minimal-path-and-web-navigators.md).
export type Features = {
  // Side menu with settings, sponsors, imprint and activation codes
  menu: boolean
  // Image, sentence and speech training
  training: boolean
}

export const FEATURES: Features = {
  menu: true,
  training: true,
}
