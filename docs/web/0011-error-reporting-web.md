# 0011: Error reporting on web

## Status

Proposed

## Context

`src/services/sentry.ts` uses `@sentry/react-native`, initialises only outside `__DEV__`, and sends errors only
after the user gave analytics consent. `@sentry/react-native` does not run in the browser.

## Decision

- Add `src/services/sentry.web.ts` with the same exports. It starts as a no-op and later uses `@sentry/react` with
  the same consent gating.
- Whether the web version reports to the same Sentry project as the apps is decided with Digitalfabrik.

## Consequences

- Early web steps run without error reporting.
- Web errors can be told apart from app errors by the platform tag or a separate project.
