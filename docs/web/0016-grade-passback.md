# 0016: Grade passback

## Status

Proposed (step c of the embedded mode, 0015; to be accepted after the first grade in the Moodle gradebook)

## Context

After an LTI launch, the result of a learning mode should reach the LMS gradebook immediately (FR-03, FR-12, NFR-15),
via LTI Assignment and Grade Services (AGS), as decided in 0013. On web, only the word choice exercise ("Übung") ends
with a result screen (`ExerciseFinished`); the word list does not produce a result. The result screen shows the
number of words answered correctly on the first try ("X von Y Wörter richtig"). Lunes also computes an internal score
weighted by the number of tries (`calculateScore`), which is not shown to the learner. Moodle keeps the score a tool
sent last.

## Decision

- **Grade:** words correct on the first try out of all words of the exercise (`scoreGiven` / `scoreMaximum`), the
  same number the learner sees. Decided by the author of the thesis.
- **Attempts:** every finished attempt is sent, the LMS keeps the latest. lunes-lti stores no scores.
- **App:** `useReportResult` (native: does nothing; `useReportResult.web.ts`) sends the result once when
  `ExerciseFinished` opens, only in the embedded mode, only for the word choice exercise of the selected unit:
  `POST <base path>/lti/results` with the session token and `{ "correct", "total" }`. The returned state
  (`sending`, `submitted`, `notGraded`, `expired`, `error`) is shown in step d.
- **lunes-lti:**
  - stores the AGS endpoint claim of the launch (scopes and line item URLs, no personal data);
  - `POST /lti/results` checks the token and the result (`0 <= correct <= total`, `0 < total <= 1000`) and sends a
    score to the line item of the resource link with `activityProgress: Completed`, `gradingProgress: FullyGraded`,
    a timestamp and the pseudonymous `sub` as `userId`. Answers: `204`, `401` (token), `409 not_graded` (no AGS
    claim with the score scope, e.g. grades switched off in the LMS), `422 invalid_result`, `502 lms_error`.
  - signs the token request with the tool's key and a `kid` (RFC 7638 thumbprint of the public key). The JWKS at
    `/lti/jwks` publishes the same `kid`, so an LMS that fetches the key set by URL finds the key. PyLTI1p3 sends no
    `kid` on its own, because a PEM carries none (open point of 0014).
- **Moodle:** the tool uses the AGS service "for grade sync only" and accepts grades (registration guide of
  lunes-lti). Moodle creates the grade item of the activity and scales the score to its maximum grade.

## Consequences

- The result reaches the gradebook only while the session token is valid (two hours) and lunes-lti and the LMS are
  reachable. There is no retry and no offline buffer (FR-08), as stated in 0013.
- The app trusts itself for the result: a learner who manipulates the requests in the browser can send any score.
  Acceptable for a practice tool; graded exams would need the exercise to run on the server.
- Time on task (FR-16): the score carries only the finish time. The start time of the exercise is not tracked yet.
- Launches made before the AGS service was switched on in Moodle carry no AGS claim; their results get `not_graded`.
  The activity has to be launched again.
- First test on 2026-11-11 (development setup): Moodle answered the token request with `404`, because the tool was
  registered with "Keyset URL" and Moodle could not fetch `http://localhost:8080/lti/jwks`. In development the tool
  needs the "RSA key" option (registration guide). lunes-lti now logs only status, URL and Moodle's error message,
  not the whole error page (which contains a session key of the page).
- Second and third test on 2026-11-11: `400 OpenSSL error: … DECODER routines::unsupported` from a public key that was
  pasted with broken line breaks (registration guide: copy with `| clip`), then `401 Unauthorized` at
  `mod/lti/services.php/…/scores` although the token request succeeded. Cause: the Moodle server passes PHP requests
  from Apache to PHP-FPM (`proxy_fcgi`), which drops the `Authorization` header by default. Fix in the salt repository:
  `CGIPassAuth On` for the Moodle directory (merge request `feature/moodle-cgipassauth`), applied by the server
  administrators. Other Moodle installations behind PHP-FPM need the same setting.
