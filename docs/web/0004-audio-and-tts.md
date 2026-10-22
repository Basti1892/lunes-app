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
  disabled states stay the same: the button (`AudioPlayerButton.tsx`) is shared by both implementations, only the
  playback differs. Playback stops when the player is removed or the audio changes.
- `TtsService.web.tsx` initialises `easy-speech` with a German voice (`de-DE` preferred, otherwise any `de-*`) and
  exposes the same `TtsServiceContext`. Without a German voice the state is `error` and the button for TTS texts is
  disabled (native asks to install a TTS engine instead).
- `VolumeService.web.tsx` always reports volume 1 and no silent switch. Browsers do not expose the device volume.
- `ToastAndroid` is not used on web.

## Consequences

- Audio only starts after a user gesture (browser autoplay rules). Lunes already plays audio on button press.
- Available TTS voices depend on browser and operating system. If no German voice exists, TTS is disabled.
- In an iframe the embedding page may need `allow="autoplay"` (see 0012).
- easy-speech declares `"type": "module"`, but webpack picks its CommonJS entry (our code is compiled to `require`).
  A rule in `web/webpack.config.js` treats that file as CommonJS; without it the app does not start.
- Verified in step 5: CMS audio plays in the word list and in the solution of the word choice exercise. TTS could
  not be triggered from the UI, because no word in the checked units of the test CMS lacks a recording; it is
  covered by unit tests.
