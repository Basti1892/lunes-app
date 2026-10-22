# 0001: Webpack with react-native-web

## Status

Accepted

## Context

Lunes is a bare React Native app (RN 0.84, React 19.2) bundled with Metro. A browser build is needed for an LMS
prototype. Options were Expo (web), Vite and Webpack. Expo would mean adopting the Expo toolchain in a bare app. Vite
pre-bundles dependencies with esbuild, which handles many untranspiled React Native packages (Flow, JSX in `.js`)
poorly.

## Decision

- Use Webpack with `babel-loader` and `babel-plugin-react-native-web`. `react-native` is aliased to
  `react-native-web`.
- The configuration lives in `web/` (`web/webpack.config.js`, `web/index.html`).
- `babel.config.js` and `metro.config.js` are not changed. The RNW plugin is added only in the babel-loader options,
  so Metro never sees it.
- `resolve.extensions` lists `.web.tsx`, `.web.ts`, `.web.js` before the plain extensions and never `.native.*`.
  `resolve.mainFields` is `browser`, `module`, `main`.
- `__DEV__` and `process.env.NODE_ENV` are set with `DefinePlugin`.
- `node_modules` packages that ship untranspiled code (e.g. `react-native-progress`, `@react-navigation/*`) are
  passed through babel-loader.
- The babel-loader options set `disableImportExportTransform` for `@react-native/babel-preset` (step 9). Webpack then
  gets ES modules and can remove unused code. Without it the bundle grew from 1.7 MiB to 3.2 MiB when Sentry was
  added; with it, it is 1.55 MiB including Sentry. JSON files are imported with a default import
  (`import app from './app.json'`), because webpack does not support named imports from JSON in ES modules.

## Consequences

- Native builds are unaffected.
- The webpack config is plain JavaScript and therefore not linted or type-checked (same as the Metro config).
- The list of packages that need transpiling must be maintained when dependencies change.
