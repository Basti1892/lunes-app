# 0015: Embedded mode

## Status

Proposed (step a of the embedded mode: session token and launch data; navigation restriction, result reporting,
submission state and the link back to the course follow)

## Context

ADR 0013 decided that the web app gets an embedded mode that is active only after an LTI launch: lunes-lti redirects
to `/jobs/:jobId/units/:unitId#lti_token=<token>` (0014). The app has to take the token out of the URL (NFR-09), know
which vocabulary set the teacher selected (FR-06), send results with the token (FR-12) and tell the learner when the
token has expired (FR-11). Without a launch the web version must behave as before (NFR-11), and the native apps must
not change.

## Decision

- **Token handling before the app starts.** `src/index.web.js` calls `takeTokenFromUrl` (`src/services/ltiSession.ts`)
  before `runApplication`: the token moves into the `sessionStorage` (key `lunes-lti-token`) and is removed from the
  address bar with `history.replaceState`, so React Navigation never sees it and it does not end up in the history,
  bookmarks or shared links. Other fragment parameters stay.
  - `sessionStorage` belongs to the tab (in an iframe also to the LMS site, 0012): a reload keeps the embedded mode, a
    new tab with the plain app is standalone. If the browser blocks the storage, the app starts standalone.
- **Launch data from the service, not from the URL.** The app asks `GET <base path>/lti/session` with
  `Authorization: Bearer <token>`. lunes-lti answers `{ jobId, unitId, returnUrl, expiresAt }` from its stored launch,
  or `401` with `{ "error": "expired" | "invalid" | "missing" }`. The selected set therefore cannot be changed by
  editing the URL, and the app gets the return URL of the LMS (`launch_presentation.return_url`, now stored by
  lunes-lti) for the link back to the course (FR-13).
- **Embedded mode as a context.** `EmbeddedModeService.tsx` (native: always `standalone`, the provider only renders
  its children) and `EmbeddedModeService.web.tsx` (reads the token, loads the session). The state is `standalone`,
  `loading`, `active` (with the session), `expired` (any `401`) or `error` (service not reachable). Screens read it
  with `useEmbeddedMode()`. The provider wraps the navigation in `App.tsx`.
  - Context, type and hook live in `embeddedModeContext.ts`, a module without a `.web` sibling: an import of
    `./EmbeddedModeService` inside `EmbeddedModeService.web.tsx` resolves to the `.web` file itself in webpack, which
    left the context `undefined` (jest resolves it to the native file, so only the browser showed it). Rule for future
    pairs that share values, not only types: put the shared values into a third module.

## Consequences

- No visible change yet: the state is available, but no screen uses it. The next steps use it to restrict navigation
  to the selected set, report results on `ExerciseFinished` and show the submission state and the link back.
- `App.tsx` (shared) gains one provider; on native it renders only its children.
- Verified in the browser (dev server, lunes-lti not running): a URL with `#lti_token=…` is cleaned before the app
  renders, the token is in the `sessionStorage`, `/lti/session` is requested (`504` without the service, state
  `error`); without a token no `/lti` request is made.
- Verified on 2026-11-10 with a real launch from moodle-lunes.tuerantuer.org (student, embedded, development setup):
  `/lti/session` answers `200` with job, unit and the return URL; the token is in the partitioned `sessionStorage` of
  the third-party iframe (DevTools: frame origin `http://localhost:8080`, top-level site `https://tuerantuer.org`).
- Moodle's return URL points to `/mod/lti/return.php?course=…&launch_container=…`, a Moodle page that leads back to
  the course. Opened inside the iframe it would show the course page within the course page, so the link back
  (FR-13) has to open it in the top-level window (`target="_top"`).
