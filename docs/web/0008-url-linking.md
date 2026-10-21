# 0008: URL linking

## Status

Proposed

## Context

Professions and vocabulary sets should be reachable through their own URL, so an LMS course can link to them.
Today the only linking config (`src/App.tsx`) maps `activation/:code`, with the prefixes `lunes://lunes.app` and
`https://lunes.tuerantuer.org`. Screens receive whole objects as params (`UnitSelection: {job}`,
`StandardExercises: {unit, jobTitle}`, exercise screens: `vocabularyItems[]`), and IDs are objects
(`{type: 'standard', id}`). There is no CMS endpoint for a single unit.

## Decision

- Move the existing config into `src/navigation/deepLinking.ts` unchanged and add `deepLinking.web.ts`:
  - `/` → `Home`
  - `/select-job` → `JobSelection`
  - `/jobs/:jobId` → `UnitSelection`
  - `/jobs/:jobId/units/:unitId` → `StandardExercises`
  - `/activation/:code` → `Activation`
- `UnitSelection` and `StandardExercises` accept an optional ID param and load the object when it is missing
  (`useLoadJob`; `useLoadUnits` plus a lookup by ID). Native navigation keeps passing objects.
- Exercise and result screens get no URL. Their state is transient; after a reload the user returns to the unit.

## Consequences

- Native deep links are unchanged, because the native config is not extended.
- Shared screens get a small param fallback, covered by unit tests.
- Content-area jobs need a token (`tokenForJob`); a direct URL to such a job only works after the job was activated
  in that browser.
