# Web version

Lunes is a React Native app. The `web-version` branch adds a browser build (react-native-web + Webpack) that also
runs embedded in an iframe on an LMS course page. The native apps stay unchanged.

- [Analysis](analysis.md): repository structure, minimal user path, native dependencies, web blockers.
- Architecture decision records (ADRs): see the index below.
- Working rules for this branch: [CLAUDE.md](../../CLAUDE.md).

## Architecture decision records

Each ADR is a short Markdown file `NNNN-short-title.md` with the sections Status, Context, Decision and Consequences.
Status is one of `Proposed`, `Accepted`, `Superseded by NNNN` or `Open` (needs a decision from outside this branch).
Add a new ADR instead of rewriting an accepted one.

| ADR                                             | Title                           | Status   |
| ----------------------------------------------- | ------------------------------- | -------- |
| [0001](0001-webpack-with-react-native-web.md)   | Webpack with react-native-web   | Accepted |
| [0002](0002-platform-files-and-adapters.md)     | Platform files and adapters     | Accepted |
| [0003](0003-minimal-path-and-web-navigators.md) | Minimal path and web navigators | Proposed |
| [0004](0004-audio-and-tts.md)                   | Audio and text-to-speech        | Accepted |
| [0005](0005-svg-icons-with-svgr.md)             | SVG icons with SVGR             | Accepted |
| [0006](0006-web-dependency-placement.md)        | Placement of web dependencies   | Accepted |
| [0007](0007-backend-access-and-cors.md)         | Backend access and CORS         | Open     |
| [0008](0008-url-linking.md)                     | URL linking                     | Proposed |
| [0009](0009-persistence-on-web.md)              | Persistence on web              | Proposed |
| [0010](0010-typescript-dom-lib.md)              | TypeScript `dom` lib            | Proposed |
| [0011](0011-error-reporting-web.md)             | Error reporting on web          | Proposed |
| [0012](0012-iframe-embedding.md)                | Iframe embedding                | Proposed |

## Implementation plan (small, testable steps)

After every step:

- Run `yarn lint`, `yarn ts:check`, `yarn prettier --check .` and `yarn test`.
- Do a manual browser check.
- Claude proposes a commit message; the user commits.
- `yarn ios` / `yarn android` must stay unaffected: no edits under `android/` or `ios/`, and no changes to native behavior.

**Step 0: docs.** `CLAUDE.md`, this README, [analysis.md](analysis.md) and the ADR stubs. Done.

**Step 1: Webpack skeleton that renders a single screen.**

1. The user installs:
   - Runtime packages: `yarn add react-native-web react-dom@19.2.3`
   - Build tools: `yarn add -D webpack webpack-cli webpack-dev-server html-webpack-plugin babel-loader babel-plugin-react-native-web`
2. New files:
   - `web/webpack.config.js`:
     - alias `react-native$` → `react-native-web`
     - `.web.*` extensions first
     - babel-loader reusing `babel.config.js` plus the RNW plugin
     - `DefinePlugin` for `__DEV__` and `process.env.NODE_ENV`
     - `devServer` with `historyApiFallback`
   - `web/index.html`: a `#root` div.
   - `index.web.js`: mirrors `index.js`.
   - `src/index.web.js`: `registerComponent` plus `runApplication`. For this step it renders a temporary `WebPreviewScreen` that shows existing components (`Title`, `Button`) inside the styled-components `ThemeProvider`.
3. Scripts: `"web": "webpack serve --config web/webpack.config.js"` and `"web:build": "webpack --config web/webpack.config.js --mode production"`. Output goes to `build/web` (already git- and prettier-ignored via `.gitignore`).
4. Verify: `yarn web` opens http://localhost:8080 and shows the components without console errors, and the four checks pass.

**Step 2: SVG and fonts.**

1. The user runs `yarn add -D @svgr/webpack`.
2. Add an SVG rule (DOM target, `currentColor` kept). Add `@font-face` rules for SourceSansPro through an asset module.
3. Verify: the preview shows an icon in two different `color`s, and text renders in SourceSansPro.

**Step 3: Shared-module adapters (decision A).**

1. Move the native calls behind small modules we own. Add a `.web.ts` sibling for each; native behavior stays unchanged.
2. Adapters:
   - `src/services/fileSystem.ts` (+ `.web.ts`): `DocumentDirectoryPath`, `unlink`, `moveFile`.
   - `src/services/deviceInfo.ts` (+ `.web.ts`): `getVersion`, `isTablet`, `isEmulatorSync`.
   - `NotificationService.web.ts`: no-op.
   - `sentry.web.ts`: no-op for now.
   - `services/apiBaseUrl` (+ `.web`): relative `/api/v2` behind the dev proxy.
3. Update the imports in `Storage.tsx`, `storageUtils.ts`, `UserVocabularyProcessScreen.tsx`, `axios.ts`, `BottomTabNavigator.tsx`, `VolumeService.tsx` and `VersionPressable.tsx`.
4. Add `"dom"` to the tsconfig `lib`, and add jest specs for the web adapters (imported explicitly).
5. Verify: native tests stay green. The web preview mounts `StorageProvider` and data from `GET jobs` appears through the proxy.

**Step 4: Real app shell on web with pruned navigators.**

1. Switch `src/index.web.js` to `App`.
2. Add `Navigator.web.tsx`, with the root screens JobSelection, BottomTabNavigator, VocabularyList, VocabularyDetailExercise, WordChoiceExercise and ExerciseFinished.
3. Add `BottomTabNavigator.web.tsx` (HomeTab only, tab bar hidden) and `HomeStackNavigator.web.tsx` (Home, UnitSelection, StandardExercises).
4. Hide entry points to removed routes (menu, training card, manage selection) with small `.web` components where needed.
5. Temporary stubs: `TtsService.web.tsx` and `VolumeService.web.tsx` as pass-through providers, so the bundle builds.
6. Verify: first start → JobSelection → Home → UnitSelection → StandardExercises, with no build errors from camera, permissions or speech modules.

**Step 5: Audio.**

1. The user runs `yarn add easy-speech`.
2. `AudioPlayer.web.tsx`: `HTMLAudioElement` for URLs and easy-speech for TTS, with the same props, icons and disabled states.
3. `TtsService.web.tsx`: `EasySpeech.init` with a de-DE voice, exposing the same `TtsServiceContext`.
4. `VolumeService.web.tsx`: volume 1, never silent.
5. Verify: VocabularyList plays CMS audio, and plays TTS for a word without audio. WordChoice plays the solution audio.

**Step 6: Rest of the exercise path.**

1. `ImageCarousel.web.tsx`: a horizontal `ScrollView` with paging, or arrow buttons, instead of pager-view.
2. `ShareButton.web.tsx`.
3. Check the `ExerciseHeader` cancel/confirm modal and the AnalyticsConsentModal.
4. Verify: the full path through `ExerciseFinished`, including "repeat" and "finished".

**Step 7: URL linking.**

1. `src/navigation/deepLinking.ts` (+ `.web.ts`): move the existing config out of `App.tsx` unchanged. The web version maps:
   - `''` → Home
   - `jobs/:jobId` → UnitSelection
   - `jobs/:jobId/units/:unitId` → StandardExercises
   - `select-job` → JobSelection
   - `activation/:code`
2. Exercise and result screens get no path. Their state is transient, and a reload redirects back to the unit.
3. `UnitSelection` and `StandardExercises` accept an optional id param and load the object when it is missing:
   - UnitSelection via `useLoadJob`.
   - StandardExercises via `useLoadUnits` plus a lookup by id.
   - Token comes from `tokenForJob`.
   - Native navigation keeps passing objects.
4. Verify: open `/jobs/1` and `/jobs/1/units/5` directly and reload them; browser back/forward work. Add unit tests for the param fallback.

**Step 8: Iframe readiness.**

1. Add `web/iframe-test.html`, which embeds the build. Test storage persistence, audio after a user gesture, `speechSynthesis` and deep-link URLs in the iframe `src`.
2. Make `publicPath` configurable for hosting under a subpath.
3. Document the hosting requirements: SPA fallback, `frame-ancestors`, and CORS or a same-origin proxy.

**Step 9: Sentry web and production build.**

1. The user runs `yarn add @sentry/react`.
2. `sentry.web.ts` gets the same consent gating as native.
3. Document the build and deploy steps in `docs/web/README.md`.
