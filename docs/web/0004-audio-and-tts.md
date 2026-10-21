# 0004: Audio and text-to-speech

## Status

Accepted

## Context

`src/components/AudioPlayer.tsx` plays CMS audio URLs with `react-native-sound-player` and falls back to
`react-native-tts` for words without audio. `src/services/TtsService.tsx` initialises TTS, and
`src/services/VolumeService.tsx` disables playback when the device is muted (`react-native-volume-manager`). None of
these work in the browser.

## Decision

- `AudioPlayer.web.tsx` plays URLs with `HTMLAudioElement` and speaks text with `easy-speech`. Props, icons and
  disabled states stay the same.
- `TtsService.web.tsx` initialises `easy-speech` with a German (`de-DE`) voice and exposes the same
  `TtsServiceContext`.
- `VolumeService.web.tsx` always reports volume 1 and no silent switch. Browsers do not expose the device volume.
- `ToastAndroid` is not used on web.

## Consequences

- Audio only starts after a user gesture (browser autoplay rules). Lunes already plays audio on button press.
- Available TTS voices depend on browser and operating system. If no German voice exists, TTS is disabled.
- In an iframe the embedding page may need `allow="autoplay"` (see 0012).
