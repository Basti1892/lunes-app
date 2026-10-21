# 0009: Persistence on web

## Status

Proposed

## Context

All app state (selected professions, progress, repetition, settings) is stored with
`@react-native-async-storage/async-storage` through `src/services/Storage.tsx`, including migrations up to storage
version 8. User vocabulary stores images and recordings on the file system (`@dr.pogodin/react-native-fs`).

## Decision

- Use AsyncStorage's built-in localStorage implementation on web. Storage code and migrations stay unchanged.
- The file system adapter is a stub on web (see 0002). User vocabulary is not available on web.

## Consequences

- Progress is stored per browser and per origin. Clearing site data resets the app.
- In a third-party iframe, browsers partition storage by top-level site. Safari may delete it after 7 days without
  interaction. This is acceptable for the prototype; a server-side or LMS-side store would be needed for durable
  progress.
