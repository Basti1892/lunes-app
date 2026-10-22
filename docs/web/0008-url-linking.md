# 0008: URL linking

## Status

Accepted (implemented in step 7)

## Context

Professions and vocabulary sets should be reachable through their own URL, so an LMS course can link to them.
Before, the only linking config (in `src/App.tsx`) mapped `activation/:code`, with the prefixes `lunes://lunes.app`
and `https://lunes.tuerantuer.org`. Screens receive whole objects as params (`UnitSelection: {job}`,
`StandardExercises: {unit, jobTitle}`, exercise screens: `vocabularyItems[]`), and IDs are objects
(`{type: 'standard', id}`). There is no CMS endpoint for a single unit.

## Decision

- The native config moved unchanged to `src/navigation/deepLinking.ts`. The web config is
  `src/navigation/deepLinking.web.ts`:
  - `/` → no fixed state: the app starts with `JobSelection` on first start, otherwise with `Home`
  - `/select-job` → `JobSelection`
  - `/jobs/:jobId` → `UnitSelection` (with `Home` below it)
  - `/jobs/:jobId/units/:unitId` → `StandardExercises` (with `Home` and `UnitSelection` below it, so going back
    leads to the units of the job)
  - `/manage-jobs` → `ManageSelection`
- The route params are unions: `UnitSelection: { job } | { jobId }` and
  `StandardExercises: { unit, jobTitle } | { jobId, unitId }`. The apps keep passing the objects. With ids only, the
  screens load the job (`useLoadJob`) or the unit (`useLoadUnit`: units of the job, then lookup by id) first.
- `getPathFromState` builds the URL from a copy of the state in which the job and unit objects are replaced by their
  ids, other objects are dropped and exercise and result screens are cut off. While an exercise is open the URL stays
  the one of its unit; after a reload the user is back at the unit.
- `/activation/:code` is not available on web, because the `Activation` screen is not part of the minimal path.

## Consequences

- Native deep links are unchanged, because the native config is not extended.
- Shared screens get a small loader for the id case, covered by unit tests.
- Browser back and forward work between Home, units of a job and exercises of a unit.
- Content-area jobs need a token (`tokenForJob`); a URL to such a job only works after the job was activated in that
  browser. Their screens keep the URL of Home.
- Opening `/jobs/:jobId` does not add the job to the selected professions. Home therefore stays empty if the app was
  only opened via such a link.
- `NavigationTypes.ts` does not list the screens of the home stack in `HomeTabParams`, so `initialRouteName` in the
  web config needs a `@ts-expect-error`.
