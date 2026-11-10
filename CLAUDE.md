# Lunes – web version (branch `web-version`)

## Goal

Run Lunes in the browser, also embedded in an iframe on an LMS course page, as the basis for a master's thesis
prototype (Lunes ↔ LMS). The branch will be handed over to Digitalfabrik and must stay mergeable: follow
[docs/conventions.md](docs/conventions.md) and keep the native apps unchanged.

Background, analysis and decisions: [docs/web/](docs/web/README.md).

## Fixed decisions (see docs/web/ for ADRs)

- Bundler: Webpack + `babel-plugin-react-native-web` (config in `web/`). No Expo, no Vite.
  `babel.config.js` and `metro.config.js` stay Metro-only; the RNW plugin is added in the babel-loader options.
- Native apps must keep working unchanged. Never touch files under `android/` or `ios/`.
- Do not remove or change native dependencies. Web packages imported from `src` go into `dependencies`,
  build tools into `devDependencies`.
- Web replacements: HTML `<audio>` for sound, `easy-speech` for text-to-speech, `@sentry/react` instead of
  `@sentry/react-native`, `@svgr/webpack` for SVG icons (keep `fill="currentColor"` and the single `color` prop).
- May be disabled on web: camera, image picker, notifications, file system, permissions, volume manager,
  device info, speech-to-text.

## The `.web.*` rule

Web-specific behavior lives in platform files next to the native file (`AudioPlayer.web.tsx` next to
`AudioPlayer.tsx`), resolved by Webpack's `.web.*` extensions.

- A `.web.*` file exports exactly the same names and types as its native sibling. Where possible, type web stubs with
  the native signature (`export const unlink: typeof NativeFileSystem.unlink = ...`, using `import type`).
- Native libraries used by shared modules are wrapped in a small adapter we own (e.g. `src/services/fileSystem.ts`)
  that gets a `.web.ts` sibling. No webpack aliases for native packages.
- No `Platform.OS === 'web'` branches in shared code unless an ADR says otherwise.
- Web navigators (`*Navigator.web.tsx`) register only the screens of the minimal path.

## Minimal user path (must always work on web)

Start → `JobSelection` (select profession) → `Home` → `UnitSelection` (vocabulary set) → `StandardExercises` →
`VocabularyList` (audio) / `WordChoiceExercise` (audio) → `ExerciseFinished`.

Everything else may be hidden on web.

## URLs

- `/` Home (or JobSelection on first start), `/select-job` JobSelection, `/jobs/:jobId` UnitSelection,
  `/jobs/:jobId/units/:unitId` StandardExercises, `/manage-jobs` ManageSelection. Exercises keep the URL of their unit.
- The web linking config lives in `src/navigation/deepLinking.web.ts`; the native config stays unchanged.

## Commands (Windows, Yarn via corepack)

- `corepack enable`, then `yarn install`
- `yarn web`: dev server on http://localhost:8080 (proxies `/api` to the lunes-test CMS and `/lti` to a local
  lunes-lti on port 5000, override with `LUNES_LTI_ORIGIN`)
- `yarn web:build`: production bundle in `build/web`
- Native: `yarn start`, `yarn android`, `yarn ios` (must keep working)
- `yarn web` and open http://127.0.0.1:8080/iframe-test/index.html: the app in a cross-site iframe on a mock LMS page
- Base path (PowerShell): `$env:LUNES_BASE_PATH='/lunes'; yarn web:build`. Git Bash turns `/lunes` into a Windows path.
- Sentry: `$env:LUNES_SENTRY_DSN='<dsn>'; yarn web:build`. Without it the web version sends no errors (ADR 0011).
- Build and deploy: see [docs/web/README.md](docs/web/README.md#build-and-deploy).

## Checks every step must pass

- `yarn lint`
- `yarn ts:check`
- `yarn prettier --check .`
- `yarn test`
- Manual run through the minimal path in the browser (`yarn web`)

## Working rules

- Small steps. After each step run all checks and show the results.
- Claude does not commit and does not add, install or upgrade packages (Nortal policy). Claude proposes the commit
  message and the exact `yarn add` command; the developer runs them.
- Commit messages: English, imperative mood. No issue key prefix for now (deviation from docs/conventions.md; add
  keys once issues exist, at the latest before handover).
- Do not touch files under `android/` or `ios/`.
- If a decision above turns out to be unworkable, stop and explain why instead of working around it.
- Record new or changed decisions as an ADR in `docs/web/`.

## Known external dependency

The CMS sends no CORS headers (the `OPTIONS` preflight returns 405). Development uses the webpack dev server proxy;
production needs CORS in the CMS or a same-origin reverse proxy. See
[docs/web/0007-backend-access-and-cors.md](docs/web/0007-backend-access-and-cors.md).
