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
  - `HomeStackNavigator.web.tsx`: `Home`, `UnitSelection`, `StandardExercises`.
- Entry points to routes that do not exist on web (overlay menu, training, manage selection, dictionary, repetition,
  user vocabulary) are hidden with small `.web.*` components where needed.

## Consequences

- Unused native modules are not part of the web bundle.
- The web navigators duplicate part of the native navigator setup and can drift. Keep them small and check them
  when routes change.
