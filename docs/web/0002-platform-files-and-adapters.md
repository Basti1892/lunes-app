# 0002: Platform files and adapters

## Status

Accepted

## Context

Web-specific behavior must not change the native apps. Some native libraries (e.g. `@dr.pogodin/react-native-fs`,
`@notifee/react-native`, `react-native-device-info`) are imported by shared modules that every screen loads, such as
`src/services/Storage.tsx` and `src/services/axios.ts`. Two options were considered: webpack aliases that point these
packages to stubs, or small adapter modules in `src` with a `.web.*` sibling.

## Decision

- Web-specific behavior lives in platform files next to the native file (`AudioPlayer.web.tsx` next to
  `AudioPlayer.tsx`). Webpack resolves them through the `.web.*` extensions; Metro ignores them.
- A `.web.*` file exports exactly the same names and types as its native sibling.
- Native libraries used by shared modules are wrapped in a small adapter we own, for example
  `src/services/fileSystem.ts` and `src/services/deviceInfo.ts`, each with a `.web.ts` sibling. No webpack aliases for
  native packages.
- No `Platform.OS === 'web'` branches in shared code unless another ADR allows it.

## Consequences

- Every web replacement is visible in `src` and in code review.
- Shared files get small import changes (from the package to the adapter). Native behavior stays the same.
- Jest (preset `react-native`) does not resolve `.web.*` files. Tests for web files import them explicitly.
