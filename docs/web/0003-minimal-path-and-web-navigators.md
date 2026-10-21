# 0003: Minimal path and web navigators

## Status

Proposed

## Context

All screens are imported statically by the navigators in `src/navigation/`. Several off-path screens import modules
that cannot be bundled or loaded on web (camera, permissions, speech-to-text, audio recording). Only a minimal user
path is needed on web: start, select a profession, open a vocabulary set, complete an exercise including audio, see
the result.

## Decision

- Add web navigators that register only the screens of the minimal path:
  - `Navigator.web.tsx`: `JobSelection`, `BottomTabNavigator`, `VocabularyList`, `VocabularyDetailExercise`,
    `WordChoiceExercise`, `ExerciseFinished`.
  - `BottomTabNavigator.web.tsx`: `HomeTab` only, tab bar hidden.
  - `HomeStackNavigator.web.tsx`: `Home`, `UnitSelection`, `StandardExercises`, `ManageSelection`.
    `ManageSelection` only uses storage and plain components, so it stays available for removing professions.
- Entry points to routes that do not exist on web are switched off with feature flags instead of duplicated
  components: `src/constants/features.ts` (all `true`) and `features.web.ts`. Components check e.g.
  `FEATURES.menu && ...`, so native always takes the same branch as before.
  - `menu`: the menu button in `HomeScreenHeader` (a placeholder keeps the header height).
  - `training`: the training card in `ModeSelection`.

## Consequences

- Unused native modules are not part of the web bundle.
- Shared components get a few small conditionals. This is less code to keep in sync than a `.web.*` copy of a
  whole component such as `ModeSelection`.
- The web navigators duplicate part of the native navigator setup and can drift. Keep them small and check them
  when routes change.
