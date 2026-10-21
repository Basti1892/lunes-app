# 0006: Placement of web dependencies

## Status

Accepted

## Context

The web build needs new packages. The ESLint rule `import-x/no-extraneous-dependencies` rejects imports of
devDependencies from `src` (it is relaxed only for tests). Native dependencies must not be removed or changed.

## Decision

- Packages imported at runtime from `src` on web go into `dependencies`: `react-native-web`, `react-dom`,
  `easy-speech`, `@sentry/react`.
- Build tools go into `devDependencies`: `webpack`, `webpack-cli`, `webpack-dev-server`, `html-webpack-plugin`,
  `babel-loader`, `babel-plugin-react-native-web`, `@svgr/webpack`.
- `react-dom` is pinned to the exact `react` version (currently `19.2.3`).
- Packages are added by the developer, not by an AI assistant (Nortal policy). `package.json` and `yarn.lock` are
  committed together, because CI runs `yarn install --immutable`.

## Consequences

- The web packages are pure JavaScript. Native autolinking ignores them and Metro never bundles them.
- `react-native-web` must support the React version used by the app. Check the peer ranges whenever React is upgraded.
