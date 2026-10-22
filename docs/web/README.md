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
| [0008](0008-url-linking.md)                     | URL linking                     | Accepted |
| [0009](0009-persistence-on-web.md)              | Persistence on web              | Proposed |
| [0010](0010-typescript-dom-lib.md)              | TypeScript `dom` lib            | Accepted |
| [0011](0011-error-reporting-web.md)             | Error reporting on web          | Proposed |
| [0012](0012-iframe-embedding.md)                | Iframe embedding                | Accepted |

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
   - Entry: the existing `index.js`. Its `./src/index` import resolves to `src/index.web.js` on web, so no root `index.web.js` is needed.
   - `src/index.web.js`: `registerComponent` plus `runApplication`. For this step it renders a temporary `WebPreviewScreen` that shows existing components (`Title` and the text components; `Button` imports SVGs and follows in step 2) inside the styled-components `ThemeProvider`.
3. Scripts: `"web": "webpack serve --config web/webpack.config.js"` and `"web:build": "webpack --config web/webpack.config.js --mode production"`. Output goes to `build/web` (already git- and prettier-ignored via `.gitignore`).
4. Verify: `yarn web` opens http://localhost:8080 and shows the components without console errors, and the four checks pass.

**Step 2: SVG and fonts.**

1. The user runs `yarn add -D @svgr/webpack`.
2. Add an SVG rule (SVGR `native` target, rendered by `react-native-svg` on web; `currentColor` kept, see ADR 0005). Register the SourceSansPro fonts with `@font-face` rules in `web/fonts.js` (asset modules for `.ttf` and `.png`).
3. Verify: the preview shows an icon in two different `color`s, and text renders in SourceSansPro.

**Step 3: Shared-module adapters (decision A).**

1. Move the native calls behind small modules we own. Add a `.web.ts` sibling for each; native behavior stays unchanged.
2. Adapters:
   - `src/services/fileSystem.ts` (+ `.web.ts`): `DocumentDirectoryPath`, `unlink`, `moveFile`.
   - `src/services/deviceInfo.ts` (+ `.web.ts`): `getVersion`, `isTablet`, `isEmulatorSync`.
   - `NotificationService.web.ts`: no-op.
   - `sentry.web.ts`: no-op for now.
   - `src/services/cmsRequestUrl.ts` (+ `.web.ts`): identity on native; on web the CMS URL becomes a same-origin path (`/api/v2/...`) that the dev server proxies.
3. Update the imports in `Storage.tsx`, `storageUtils.ts`, `UserVocabularyProcessScreen.tsx`, `axios.ts`, `BottomTabNavigator.tsx`, `VolumeService.tsx` and `VersionPressable.tsx`.
4. Add jest specs for the web adapters (imported explicitly). The `dom` lib is not needed yet (`URL` comes from the Node types); it moves to step 5, where `AudioPlayer.web.tsx` needs browser types.
5. Verify: native tests stay green. The web preview mounts `StorageProvider` and data from `GET jobs` appears through the proxy.

**Step 4: Real app shell on web with pruned navigators.**

1. Switch `src/index.web.js` to `App`.
2. Add `Navigator.web.tsx`, with the root screens JobSelection, BottomTabNavigator, VocabularyList, VocabularyDetailExercise, WordChoiceExercise and ExerciseFinished.
3. Add `BottomTabNavigator.web.tsx` (HomeTab only, tab bar hidden) and `HomeStackNavigator.web.tsx` (Home, UnitSelection, StandardExercises).
4. Switch off entry points to removed routes with feature flags (`src/constants/features.ts` + `.web.ts`, see ADR 0003): menu button and training card. `ManageSelection` stays available on web.
5. Web providers: `VolumeServiceProvider` (final: volume 1, never muted) and `TtsServiceProvider` (stub until step 5). Placeholders `AudioPlayer.web.tsx` (disabled button) and `ImageCarousel.web.tsx` (first image), because `react-native-sound-player` and `react-native-pager-view` cannot be bundled; replaced in steps 5 and 6.
6. Verify: first start → JobSelection → Home → UnitSelection → StandardExercises, with no build errors from camera, permissions or speech modules.

**Step 5: Audio.**

1. The user runs `yarn add easy-speech`.
2. `AudioPlayer.web.tsx`: `HTMLAudioElement` for URLs and easy-speech for TTS. The button moved into the shared `AudioPlayerButton.tsx`, so icons and disabled states are the same on both platforms.
3. `TtsService.web.tsx`: `EasySpeech.init` with a de-DE voice, exposing the same `TtsServiceContext`.
4. `VolumeService.web.tsx` (already done in step 4). Add the `dom` lib to `tsconfig.json` (ADR 0010); the easy-speech types need it. Fix for easy-speech in the webpack config (ADR 0004). `ExerciseHeader`: the Paper progress bar took the whole screen height on web, now wrapped in a 4px container.
5. Verify: VocabularyList and the WordChoice solution play CMS audio. TTS is only used for words without a recording; none of the 121 checked units on the test CMS has such a word, so TTS is covered by unit tests only.

**Step 6: Rest of the exercise path.**

1. `ImageCarousel.web.tsx`: a horizontal `ScrollView` with paging and the native dot indicator (swipe or touchpad). Images use `source={{ uri }}`, because react-native-web ignores the `src` prop of `Image`.
2. Sharing via an adapter (`src/services/share.ts` + `.web.ts`, Web Share API); the share section is hidden where the API is missing. Repetition modal on the result screen switched off with `FEATURES.repetition`. `WordChoiceExercise`: `flex-grow: 1` instead of `flex: 1` for the button container, so "Später versuchen" no longer overlaps the answers on web.
3. Checked: the cancel modal of `ExerciseHeader` and the AnalyticsConsentModal work.
4. Verified: full path through `ExerciseFinished`: all correct ("Fertig") and all wrong ("Übung wiederholen", no repetition modal).

**Step 7: URL linking.**

1. `src/navigation/deepLinking.ts` (native, moved unchanged out of `App.tsx`) and `deepLinking.web.ts`: `/`, `/select-job`, `/jobs/:jobId`, `/jobs/:jobId/units/:unitId`, `/manage-jobs` (details in ADR 0008).
2. `UnitSelection` and `StandardExercises` accept ids instead of objects and load job (`useLoadJob`) or unit (new `useLoadUnit`) first. The apps keep passing objects.
3. URLs are built from a copy of the state: objects replaced by ids, exercise and result screens cut off, so the URL stays the one of the unit.
4. Verified: clean URLs while navigating, reload on a unit URL, direct links on an empty storage, header back from a direct link to the units of the job, browser back and forward.

**Step 8: Iframe readiness.**

1. `web/iframe-test/index.html`: mock LMS course page, served by the dev server. Open http://127.0.0.1:8080/iframe-test/index.html; it embeds the app from `localhost`, so the iframe is cross-site.
2. `LUNES_BASE_PATH` for hosting under a subpath: routes, assets and the `/api` proxy live below it (ADR 0012).
3. Hosting requirements documented in ADR 0012: SPA fallback, `frame-ancestors`, API proxy or CORS.
4. Verified: same-origin iframe (links, navigation, audio, TTS voices), the base path `/lunes` (build and dev server) and, by hand, a cross-site iframe (storage, audio, unit links). Still open: Safari.
5. Fixes found while testing: the arrow of the header back button did not react on web, because the icon is replaced while pressed and the browser then drops the click (`NavigationHeaderLeft`: icon wrapped in a container with `pointer-events: none`). `ExerciseHeader` no longer uses `BackHandler` on web (adapter `src/services/hardwareBackPress.ts` + `.web.ts`), which logged an error in every exercise.

**Step 9: Sentry web and production build.**

1. The user runs `yarn add @sentry/react`.
2. `sentry.web.ts` gets the same consent gating as native.
3. Document the build and deploy steps in `docs/web/README.md`.

## Known issues

Found during the steps above and not fixed yet.

- **List items need a press of at least one frame.** `ListItem` stores the press-in position with `useState` and
  compares it in `onPressOut`. react-native-web handles presses with its own DOM listeners, so if press and release
  happen before React re-renders, `onPressOut` still sees no press-in position and ignores the press. Normal clicks
  work; automated clicks and possibly very short touchpad taps do not. A `useRef` instead of `useState` would fix
  this on all platforms. Found in step 4.
- **List item content is centered on web** (e.g. job selection, unit selection) instead of left-aligned, and the
  check icon sits next to the title instead of at the right edge. Found in step 4.
- **React warning about `collapsable`** in development: `@react-navigation/stack` passes `collapsable={false}`, which
  ends up as a DOM attribute. No visible effect.
- **Build warnings for optional modules**: `react-native-gesture-handler` looks for `react-native-reanimated`,
  `react-native-paper` for vector icon packages. Both are optional and not installed for the native apps either.
- **Images can only be changed by swiping or touchpad scrolling.** With a mouse there are no arrow buttons in the
  web carousel. All checked words of the test CMS have exactly one image, so this is not visible yet. Found in step 6.
- **Sharing is hidden where the Web Share API is missing**, e.g. in Firefox on desktop and in iframes without
  `allow="web-share"`. Found in step 6.
- **A link to a profession does not select it.** Opening `/jobs/:jobId` shows the units, but Home stays empty if the
  app was only opened via such a link. Found in step 7.
- **Browser back skips the cancel dialog of an exercise**, because the URL does not change while an exercise is
  open. Found in step 7.
