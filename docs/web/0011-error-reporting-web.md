# 0011: Error reporting on web

## Status

Accepted (step 9). Which Sentry project the web version reports to is still open, see Consequences.

## Context

`src/services/sentry.ts` uses `@sentry/react-native` with the DSN of the Digitalfabrik Sentry project hardcoded. It
initialises only outside `__DEV__`, and `reportError` sends errors only after the user gave analytics consent.
`@sentry/react-native` does not run in the browser.

A test of the production build showed that the Sentry defaults bypass the consent check of `reportError`: right after
`init`, before any consent, the SDK sends a session (release health), and errors it captures by itself (uncaught
exceptions, unhandled rejections) are sent without asking `reportError`. `@sentry/react-native` has the same defaults.

## Decision

- `src/services/sentry.web.ts` uses `@sentry/react` with the same exports as the native file.
- Sentry is only active in production builds **and** if a DSN is set with `LUNES_SENTRY_DSN` when building. Without
  it nothing is sent. The Digitalfabrik DSN is not reused without their agreement.
- Consent is checked for every event in `beforeSend` (`sendOnlyWithConsent`), so it also covers errors Sentry
  captures by itself. Session tracking (`BrowserSession` integration) is switched off.
- Events are tagged `platform: web` and use the release `lunes-web@<version>`.
- The analytics consent dialog is not shown on web (prototype decision after step 9). Without an answer the consent
  is not given, so the web version sends neither analytics events nor error reports. The settings screen, where the
  apps let users change their choice, is not part of the web version either.
- To keep the bundle small, webpack gets ES modules from babel (`disableImportExportTransform` in the babel-loader
  options, see 0001), so unused parts of Sentry (e.g. Session Replay) are removed.

## Consequences

- Verified with the production build and the DSN `https://public@sentry.invalid/1` (reserved domain, never reaches a
  server): no request on page load, no request for an uncaught error without consent, one request with consent.
- As long as the consent dialog is hidden, a DSN has no effect: errors of the web version are not reported. To collect
  them (or analytics data, e.g. for the evaluation of the prototype), the dialog or another way to give consent has to
  be added on web.
- The web version is stricter than the apps. The apps send sessions and automatically captured errors without
  consent; this may be worth raising with Digitalfabrik.
- Open: a separate Sentry project for the web version or the existing one with the `platform` tag, to be decided with
  Digitalfabrik.
- Source maps are built but not uploaded to Sentry; stack traces of the minified bundle are therefore hard to read.
