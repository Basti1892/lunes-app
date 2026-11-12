# 0015: Embedded mode

## Status

Proposed (steps a, b and d of the embedded mode: session token, launch data, navigation restricted to the selected
set, submission state and the link back to the course; result reporting in 0016)

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

- **Navigation restricted to the selected set (FR-06).** With an active session, the web home stack
  (`HomeStackNavigator.web.tsx`) registers only `StandardExercises`, with the job and unit of the session as params and
  without the header back button ("Einheiten"). The other screens of the minimal path are not reachable from there:
  exercises and the result screen only go back to the unit (`pop`), and the repetition tab does not exist on web.
  - The navigator gets a key per session (`embedded-<job>-<unit>`). The stack therefore starts anew when the session
    has loaded; Home and UnitSelection below the unit (from the URL) are dropped.
  - The screen always gets the job and unit of the session (`EmbeddedUnitScreen`), not the params of the route: React
    Navigation fills them from the URL, and they win over `initialParams`. Found in step d: with a session for unit
    847, the URL `/jobs/219/units/849` showed unit 849, so the set could be changed by editing the URL. `setParams`
    did not correct the params of the restored route, so the screen ignores them. The address bar may keep the other
    unit ID; it has no effect.
  - While the session loads, and if it expired or the service is unreachable, the normal navigation stays; the
    selected set is only known from the service.
- **No sharing in the embedded mode.** The result screen hides "Ergebnisse teilen" when the app was launched from an
  LMS (any state other than `standalone`): in school, results go to the gradebook, not to friends. `ShareSection`
  (shared) reads the embedded mode; the apps are always standalone, so they keep the section.
- **No favorites and no word feedback in the embedded mode** (decided by the author of the thesis on 2026-11-12). The
  star (`FavoriteButton`, exercise and word list) saves a favorite that no web screen shows, and navigation is
  restricted to the selected set anyway. The feedback button in the exercise header (`ExerciseHeader`) sends a comment
  and an optional e-mail address to the Lunes CMS, a channel from learners to a third party outside the course
  (NFR-04, NFR-10); in a course, the teacher is the contact for content problems. Both components read the embedded
  mode like `ShareSection`; the standalone web version and the apps keep them.
- **No notes in the embedded mode** (decided by the author of the thesis on 2026-11-12). "Notiz hinzufügen" in the word
  list (`VocabularyNoteSection`) and after an answer in the exercise (`VocabularyNotePreview`) is hidden. Notes work
  on web, but they stay in the browser: on a computer shared in school the next learner sees them, browsers keep the
  storage of an embedded iframe separately per LMS site and may clear it, and they are not part of the course.

- **Submission state on the result screen (FR-11, FR-12).** `ExerciseFinished` shows the state returned by
  `useReportResult` below the score (`ResultReportSection`, shared): sending, submitted, the activity does not accept
  grades, session expired (open Lunes again from the course), or not submitted (finish the exercise again to resend).
  Problems are shown in bold dark text: the red of incorrect answers (`#ff5252`) has a contrast of only about 3.3:1
  on the light background, below the 4.5:1 that WCAG AA asks for normal text. The text is a polite live region, so screen readers announce
  the change. Without a launch the state is `none` and nothing is shown, so the apps are unchanged.
- **Hint for a session that cannot be used (FR-11).** If the session has expired (`401`) or lunes-lti cannot be
  reached when the app starts, a banner above the app (`EmbeddedModeNotice`, shared, rendered in `App.tsx`) says that
  results will not reach the course and how to fix it (open Lunes again from the course, or reload). Lunes keeps
  working with the normal navigation, so a learner can still practise. Dark text on the light red background of the
  theme (contrast above 4.5:1); `accessibilityRole="alert"`. Nothing is shown while loading, in the active session,
  or standalone, so the apps are unchanged.
- **Link back to the course (FR-13).** In the embedded mode, the header of the unit shows "Zurück zum Kurs" where the
  back button was: an HTML link (`BackToCourseLink.tsx`, used only by `HomeStackNavigator.web.tsx`) to the return URL
  of the LMS with `target="_top"`, so the LMS page replaces the whole tab instead of opening inside the iframe. Only
  `http` and `https` URLs are linked (lunes-lti checks the same); without a return URL the header stays empty. A link
  rather than a script: it works with the keyboard, shows its target, and needs no access to the parent window.
  The result screen gets no link of its own (decided by the author of the thesis on 2026-11-12): it leads back to the
  unit, whose header has the link, and the course page around the iframe stays usable with its own navigation.

## Consequences

- Visible change: after a launch, the unit header shows "Zurück zum Kurs" instead of the back button, and the result
  screen tells whether the result reached the gradebook.
- Verified on 2026-11-11 in the browser with a stand-in for lunes-lti (dev server, session for unit 616 with a return
  URL): the header shows "Zurück zum Kurs" as a link with `target="_top"`; a URL with another unit shows the unit of
  the session; after the word choice exercise (5 of 6 correct on the first try) the app sent `{"correct":5,"total":6}`
  once and the result screen showed "Dein Ergebnis wurde an den Kurs übertragen." Not yet verified inside Moodle.
- While the session loads (usually a fraction of a second), the normal navigation is visible before the stack switches
  to the selected set.
- The native navigators are unchanged; only `HomeStackNavigator.web.tsx` reads the embedded mode.
- `App.tsx` (shared) gains one provider and the notice; on native the provider renders only its children and the
  notice renders nothing.
- Verified in the browser (dev server, lunes-lti not running): a URL with `#lti_token=…` is cleaned before the app
  renders, the token is in the `sessionStorage`, `/lti/session` is requested (`504` without the service, state
  `error`); without a token no `/lti` request is made.
- Verified on 2026-11-10 with a real launch from moodle-lunes.tuerantuer.org (student, embedded, development setup):
  `/lti/session` answers `200` with job, unit and the return URL; the token is in the partitioned `sessionStorage` of
  the third-party iframe (DevTools: frame origin `http://localhost:8080`, top-level site `https://tuerantuer.org`).
- Verified on 2026-11-10 with a real launch (student, embedded, development setup): the unit opens without a back
  button, exercises lead back to the unit, and a reload of the frame keeps the selected set.
- Moodle's return URL points to `/mod/lti/return.php?course=…&launch_container=…`, a Moodle page that leads back to
  the course. Opened inside the iframe it would show the course page within the course page, so the link back
  (FR-13) has to open it in the top-level window (`target="_top"`).
- Two scrollbars in Moodle (accepted, decided by the author of the thesis on 2026-11-12): Moodle sets the height of the
  embedded iframe to the window height below its top edge (`mod/lti/view.php`), and the course page has its footer
  below it, so the page scrolls as well as the app inside. Moodle does not support `lti.frameResize` messages, so the
  app cannot change the iframe height. Theme CSS on `#page-mod-lti-view` or the launch container "New window" would
  remove the outer scrollbar, at the cost of the footer or the embedding.
