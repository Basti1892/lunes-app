# 0010: TypeScript `dom` lib

## Status

Accepted (applied in step 5)

## Context

`tsconfig.json` extends `@react-native/typescript-config`, whose `lib` contains only ECMAScript libraries. `.web.*`
files that use `window`, `HTMLAudioElement` or `localStorage` therefore fail `yarn ts:check`. All files under `src`
are checked with this one config.

## Decision

Add `dom` and `dom.iterable` to `compilerOptions.lib` in `tsconfig.json` (together with the ES libraries of the
base config).

## Consequences

- `.web.*` files type-check with the existing `yarn ts:check`.
- DOM globals also type-check in native files, where they do not exist at runtime. Code review must catch DOM use
  outside `.web.*` files.
