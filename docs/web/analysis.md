# Web version: analysis

Analysis of the `lunes-app` repository for a browser build (react-native-web + Webpack). Created at the start of the `web-version` branch; line numbers refer to that state.

## 1. Repository structure

- **Root**: one RN app. Yarn 3.2.2 (`yarnPath`), `nodeLinker: node-modules`, workspaces `modules/*`, `postinstall: patch-package`.
- **`modules/speech-to-text`**: the only workspace. A TurboModule; `src/NativeSpeechToText.ts:11` calls `TurboModuleRegistry.getEnforcing` when the module loads, so importing it throws on web.
- **`src/`**:
  - `App.tsx`: providers, then `NavigationContainer`.
  - `navigation/`: navigators and the `RoutesParams` types.
  - `routes/`: screens.
  - `components/`, `hooks/`, `services/`: Storage, axios/CmsApi, TTS, Volume, Sentry, Notifications, Repetition.
  - `constants/`: `theme`, plus `data.ts` with the exercise definitions.
- **`assets/images`**: 52 SVGs and 3 unused PNGs. `assets/fonts`: SourceSansPro `.ttf` files.
- **Config**: `metro.config.js` (svg transformer), `babel.config.js` (RN preset plus react-compiler, which must run first), `tsconfig.json` (extends `@react-native/typescript-config`, which has **no `dom` lib**), `jest.config.ts` (`roots: ['src']`, preset `react-native`).
- **`patches/`**: stack (JS: removes InteractionManager; harmless on web), screens (iOS only), tts (Android gradle only).

**Startup sequence** (`src/App.tsx`):

- `initSentry()` runs first.
- Providers, in order: ThemeProvider, PaperProvider, SafeAreaProvider, **StorageProvider**, **VolumeServiceProvider**, **TtsServiceProvider**, ReducedMotion, then `NavigationContainer linking={deepLinking}` with `<Navigator/>`.
- StorageProvider renders `null` until AsyncStorage migrations (v0→v8) and the cache have loaded.
- Initial route (`src/navigation/Navigator.tsx:28`) is `JobSelection{initialSelection:true}` when `selectedProfessions === null`, otherwise `BottomTabNavigator`.

**Navigation tree:**

- Root stack:
  - `BottomTabNavigator`, with these tabs:
    - `HomeTab`: HomeStack with Home, UnitSelection, StandardExercises, TrainingExerciseSelection, ManageSelection, Settings, Imprint, Sponsors, GdprExport.
    - `DictionaryTab`
    - `RepetitionTab`
    - `VocabularyCollection`: material top tabs.
  - Other root screens: JobSelection, OverlayMenu, VocabularyList, VocabularyDetailExercise, WordChoiceExercise, Image/Sentence/SpeechTraining, TrainingFinished, ExerciseFinished, Activation, ActivationCodeEntry.
- Existing linking (`App.tsx:20-27`):
  - Prefixes are `lunes://lunes.app` and `https://lunes.tuerantuer.org`.
  - The only mapped route is `Activation: 'activation/:code'`.

## 2. Minimal user path → screens

| Step                       | Route (navigator)                                    | File                                                                                            | Params                                                                | Data / services                                                                                                                                        |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Start                      | (providers)                                          | `src/App.tsx`                                                                                   | —                                                                     | Storage migrations, TTS init, volume listener                                                                                                          |
| Select profession          | `JobSelection` (root)                                | `src/routes/job-selection/JobSelectionScreen.tsx`, `components/JobSelection.tsx`                | `{initialSelection:true}`                                             | `useLoadAllJobs` → `GET jobs`; `pushSelectedJob` writes `selectedProfessions`; `resetToHome`                                                           |
| Home                       | `Home` (BottomTab › HomeTab)                         | `src/routes/home/HomeScreen.tsx`, `SelectedJobs`, `JobCard`, `ModeSelection`                    | —                                                                     | `useLoadJob`, `useLoadProgress`. AnalyticsConsentModal (`BottomTabNavigator.tsx:23-54`) shows on first visit                                           |
| Open vocabulary set (unit) | `UnitSelection` (HomeStack)                          | `src/routes/UnitSelectionScreen.tsx`                                                            | `{job: Job}` (**object**)                                             | `useLoadUnits` → `GET jobs/{id}/units`                                                                                                                 |
| Exercise overview          | `StandardExercises` (HomeStack)                      | `src/routes/exercises/StandardExercisesScreen.tsx`                                              | `{unit: StandardUnit, jobTitle}` (**object**)                         | `useLoadWordsByUnit` → `GET units/{id}/words`; unlock state from `progress`                                                                            |
| Exercise 1 (audio)         | `VocabularyList` → `VocabularyDetailExercise` (root) | `src/routes/VocabularyListScreen.tsx`, `src/routes/vocabulary-detail-exercise/…`                | `ExerciseParams` = `vocabularyItems[]` (**array**), `unitId{type,id}` | `AudioPlayer` (URL or TTS), `ImageCarousel` (pager-view). Unlocks word choice. **No result screen.**                                                   |
| Exercise 2 (result)        | `WordChoiceExercise` (root)                          | `src/routes/choice-exercises/WordChoiceExerciseScreen.tsx`, `components/WordChoiceExercise.tsx` | `ExerciseParams`                                                      | Client-side quiz. `AudioPlayer` on the solution row (CMS audio URL). Wrong answer → `RepetitionService` → **notifee** reminder. `saveExerciseProgress` |
| Result                     | `ExerciseFinished` (root)                            | `src/routes/exercise-finished/ExerciseFinishedScreen.tsx`                                       | `ExerciseParams + exercise + results[]`                               | `ShareButton` (RN `Share`); `react-native-progress`                                                                                                    |

So the minimal path is JobSelection → Home → UnitSelection → StandardExercises → VocabularyList, which unlocks WordChoiceExercise → ExerciseFinished. Only two standard exercises exist (`src/constants/data.ts:47-64`).

## 3. Native dependencies and direct native APIs

Classification: **(a)** works on web as is; **(b)** needs a `.web.*` replacement or adapter; **(c)** can be disabled on web.

| Dependency                                                        | Class           | Where used                                                                                                                                       | On path? / note                                                                                    |
| ----------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `@react-navigation/*` (stack, bottom-tabs, native, elements)      | a               | navigation/\*, App.tsx                                                                                                                           | Yes                                                                                                |
| `@react-navigation/material-top-tabs` (+ tab-view)                | a               | `VocabularyCollectionTabNavigator.tsx`                                                                                                           | No. tab-view falls back to `Pager.tsx` (PanResponder) on web                                       |
| `react-native-gesture-handler`, `-screens`, `-safe-area-context`  | a               | App.tsx, RouteWrapper, BottomSheet, …                                                                                                            | Yes; all have web builds                                                                           |
| `react-native-svg`                                                | a               | `RepetitionProgressChart.tsx`; elsewhere `SvgProps` types only                                                                                   | Chart not on path                                                                                  |
| `react-native-paper`                                              | a               | App.tsx (Provider), `AudioPlayer.tsx` Tooltip, `ExerciseHeader.tsx` ProgressBar, ListEmpty                                                       | Yes                                                                                                |
| `react-native-progress`                                           | a               | `DisciplineListItem.tsx`, `ExerciseFinishedBase.tsx`                                                                                             | Yes; ships untranspiled JSX, so babel-loader must include it                                       |
| `styled-components` (`/native`, 119 files)                        | a               | everywhere                                                                                                                                       | Yes; needs the `react-native` → `react-native-web` alias                                           |
| `@react-native-async-storage/async-storage`                       | a               | `services/Storage.tsx`, `storageUtils.ts`                                                                                                        | Yes. localStorage fallback; resolve must not prefer `.native.js`                                   |
| `axios`, `axios-cache-interceptor`, `hyphen`, `normalize-strings` | a               | services/axios.ts, CmsApi.ts, hyphenation.ts, helpers.ts                                                                                         | Yes                                                                                                |
| `react-native-element-dropdown`                                   | a               | `components/Dropdown.tsx`                                                                                                                        | No (user vocabulary)                                                                               |
| `react-native-sound-player`                                       | **b**           | `components/AudioPlayer.tsx:4,77-80,111`                                                                                                         | **Yes**. Replace with HTML `<audio>` in `AudioPlayer.web.tsx`                                      |
| `react-native-tts`                                                | **b**           | `AudioPlayer.tsx:5,74,101-103`, `services/TtsService.tsx:2,16-25`                                                                                | **Yes**. Replace with `easy-speech` in `AudioPlayer.web.tsx` and `TtsService.web.tsx`              |
| `react-native-volume-manager`                                     | **b**           | `services/VolumeService.tsx:4,13-45` (provider in App)                                                                                           | **Yes**. `VolumeService.web.tsx` reports volume 1 and never silent                                 |
| `@sentry/react-native`                                            | **b**           | `services/sentry.ts:2-50`, App.tsx:30                                                                                                            | Yes. `sentry.web.ts` uses `@sentry/react` (no-op at first)                                         |
| `react-native-pager-view`                                         | **b**           | `components/ImageCarousel.tsx:3`                                                                                                                 | **Yes** (VocabularyDetail, WordChoice). `ImageCarousel.web.tsx`                                    |
| `@dr.pogodin/react-native-fs`                                     | **b** (adapter) | `services/Storage.tsx:1,95` (`DocumentDirectoryPath`, loaded at startup), `storageUtils.ts:1,521`, `UserVocabularyProcessScreen.tsx`             | Import is on path, calls are not. Adapter `services/fileSystem.ts` + `.web.ts` stub                |
| `react-native-device-info`                                        | **b** (adapter) | `services/axios.ts:4,35` (`getVersion` header), `BottomTabNavigator.tsx:3` (`isTablet`), `VolumeService.tsx:41`, `settings/VersionPressable.tsx` | Yes. Adapter `services/deviceInfo.ts` + `.web.ts` (version from `version.json`, tablet from width) |
| `@notifee/react-native`                                           | **c** (adapter) | `services/NotificationService.ts:1,15-51`                                                                                                        | **Reached** via WordChoice wrong answer → RepetitionService. `NotificationService.web.ts` no-op    |
| `react-native-speech-to-text` (workspace)                         | c               | `hooks/useVoiceRecognition.ts:2`, `SpeechTrainingScreen.tsx`                                                                                     | No, but throws on import. Pruned by web navigators                                                 |
| `react-native-vision-camera`                                      | c               | `QRCodeReaderOverlay.tsx`, `ImageSelectionOverlay.tsx`                                                                                           | No                                                                                                 |
| `react-native-image-picker`                                       | c               | `ImageSelectionOverlay.tsx`                                                                                                                      | No                                                                                                 |
| `react-native-permissions`                                        | c               | `useGrantPermissions.ts`, `CameraOverlay.tsx`, `NotAuthorisedView.tsx`, `AudioRecordOverlay.tsx`, `SpeechTrainingScreen.tsx`                     | No                                                                                                 |
| `react-native-nitro-sound` / `-nitro-modules`                     | c               | `AudioRecordOverlay.tsx:3,101` (`createSound()` at module level)                                                                                 | No                                                                                                 |
| `@react-native-picker/picker`                                     | —               | not imported                                                                                                                                     | Unused dependency (leave alone)                                                                    |
| `react-native-svg-transformer`                                    | b (build)       | `metro.config.js`                                                                                                                                | Replace with `@svgr/webpack` in the webpack config                                                 |

**React Native core APIs:**

| API                                                                                      | Class | Where                                                                         | Note                                                                           |
| ---------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ToastAndroid`                                                                           | b     | `AudioPlayer.tsx:2,106`                                                       | Removed in `AudioPlayer.web.tsx`                                               |
| `BackHandler`                                                                            | a     | `ExerciseHeader.tsx:121`                                                      | RNW no-op. Browser back behaves like a normal goBack; verify the confirm modal |
| `Share`                                                                                  | b     | `ShareButton.tsx:23` (result screen), `GdprExportScreen.tsx:39`               | `ShareButton.web.tsx`: `navigator.share` if available, else hidden             |
| `AppState`, `AccessibilityInfo`, `Linking`, `StatusBar`, `LogBox`, `useWindowDimensions` | a     | useAppState, useTrackSession, ReducedMotionService, url.ts, RouteWrapper, App | Supported or no-op on web                                                      |
| `Keyboard`                                                                               | a     | `useKeyboard.ts`, `ModalSkeleton.tsx`                                         | Listeners never fire on web; acceptable                                        |
| `TurboModuleRegistry`                                                                    | c     | `modules/speech-to-text/src/NativeSpeechToText.ts:11`                         | Pruned                                                                         |

Not used anywhere: `Alert`, `NativeModules`, `Vibration`, `PermissionsAndroid`, `Dimensions`, `useColorScheme`.

## 4. Other web blockers

1. **Every module must resolve at build time.** All screens are imported statically through the navigators. Camera, permissions (only `.android`/`.ios` method files), speech-to-text, nitro-sound and others would break the bundle even though they are off the path. Fix: web navigators that register only the minimal path (step 4 of the plan), which prunes those imports.
2. **The CMS does not allow cross-origin requests (verified with curl against lunes-test on 2026-10-21).**
   - An `OPTIONS /api/v2/jobs` preflight returns **405** and no `Access-Control-*` headers.
   - A plain `GET` with an `Origin` header returns 200 but no `Access-Control-Allow-Origin`.
   - Custom `X-os*` / `X-app-version` / `Authorization` headers (`services/axios.ts:33-35`) force a preflight on every request.
   - The API also sends `X-Frame-Options: DENY`; that only matters if the web app is served from the same host config.
   - For development: a webpack-dev-server proxy, `/api` → `https://lunes-test.tuerantuer.org`.
   - For production: CORS in the Django CMS (e.g. `django-cors-headers`) or a same-origin reverse proxy. This is an open item to agree with Digitalfabrik. It is **not** something to work around in the app.
3. **Metro / Babel.**
   - Add `babel-plugin-react-native-web` only in the webpack `babel-loader` options, so `babel.config.js` stays untouched for Metro.
   - `DefinePlugin` for `__DEV__` (used in axios.ts:20, sentry.ts, storageUtils.ts:396) and for `process.env.NODE_ENV`.
   - Resolve extensions: `.web.tsx/.web.ts/.web.js` first, then the plain ones; never `.native.*`.
   - `mainFields`: `browser`, `module`, `main` (not `react-native`).
   - Transpile these `node_modules`: react-native-progress (JSX), react-native-sound-player (Flow), packages that ship TS `src`, and `@react-navigation`.
   - Entry: a web `index` that calls `AppRegistry.registerComponent` and then `runApplication` with `rootTag`.
4. **SVG.**
   - 30 icons use `fill="currentColor"`. The other 22 have their colors baked in, which matches the convention.
   - On web, use `@svgr/webpack` producing DOM `<svg>` (not the `native` target). Then `color={…}` sets CSS `color`, and `currentColor` keeps working.
   - `width`/`height` props are compatible.
   - `src/@types/assets.d.ts` stays as it is (`ComponentType<SvgProps>`); the runtime types differ only on web.
   - Side finding: `add-circle.svg` has a hardcoded `#000e38`, but `AddVocabularyNoteButton.tsx:29` passes `color`, which has no effect. Not on the path.
5. **Fonts.** Theme families are `SourceSansPro-Regular` and `SourceSansPro-SemiBold` (`src/constants/theme/fonts.ts`). Web needs `@font-face` rules with exactly these family names, pointing at `assets/fonts/*.ttf` (webpack asset modules).
6. **Assets.** There are no `require()` image or sound assets. All images and audio are absolute CMS URLs, rendered with `<Image source={{uri}}>` and `loadUrl`. Plain `<img>` and `<audio>` don't need CORS.
7. **Platform checks.**
   - `Platform.OS` appears in 11 places; `'web'` always falls into the `else` branch.
   - Relevant on the path:
     - `axios.ts:10`: the localhost CMS URL in dev.
     - `axios.ts:33`: the `X-os: web` header. That is fine and even useful for analytics.
     - `RouteWrapper.tsx:64`
     - `ModalSkeleton.tsx:55`
   - There are no existing `.ios`/`.android`/`.web` files in `src`.
8. **AsyncStorage on web.**
   - Uses localStorage, which works.
   - In a third-party iframe, browsers partition storage, and Safari ITP may evict it after 7 days. That's acceptable for the prototype; record it in an ADR.
9. **RN-only style props.**
   - `elevation` and `shadow*`: AudioPlayer, CircularIconButton, WordItem, ShareSection, screenOptions.
   - `textAlignVertical`: CustomTextInput.
   - RNW maps shadows and ignores `elevation`. Only a visual difference.
10. **TypeScript.**
    - The base tsconfig has no `dom` lib, so `.web.ts` files that use `window`, `HTMLAudioElement` or `localStorage` fail `yarn ts:check`.
    - Fix: add `"dom"` (and `"dom.iterable"`) to `compilerOptions.lib` in `tsconfig.json`. This needs an ADR.
    - `webpack.config.js` would be ignored by ESLint (`**/*.js`) and is not in the tsconfig `include`. That is consistent with the metro config handling.
11. **Linking and params.**
    - `UnitSelection` / `StandardExercises` receive whole `Job` / `StandardUnit` objects.
    - IDs are objects (`{type:'standard', id}`).
    - Exercise screens receive whole `vocabularyItems[]`, and `ExerciseFinished` receives `results[]`. Neither can be rebuilt from a URL.
    - There is no single-unit endpoint, so the unit has to be looked up via `GET jobs/{jobId}/units`.
    - The existing `deepLinking` prefixes include `https://lunes.tuerantuer.org`. Adding paths to the shared config would change native deep-link behavior, so the linking config for web lives in a `.web` file.
12. **Release notes / CI.**
    - CI `check` runs lint, ts, prettier and tests, with `yarn install --immutable`. The user must commit `yarn.lock` together with the `package.json` changes.
    - Release-note `platforms` currently know only android/ios. Web needs no store release notes for now.
13. **React 19 compatibility.**
    - `react-native-web` must support React 19.2, and `react-dom` must be pinned to exactly `19.2.3`.
    - Check the peer ranges at install time (step 1). If they are incompatible, stop and report.
