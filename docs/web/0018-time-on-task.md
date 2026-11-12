# 0018: Time on task

## Status

Accepted (first scores with time on task in the Moodle gradebook on 2026-11-12)

## Context

ADR 0013 plans timestamps for time on task (FR-16) together with the result. Until now the score carried only the
time it was sent (0016). LTI Assignment and Grade Services (AGS) has an optional `submission` object with `startedAt`
and `submittedAt` in a score. Moodle (checked in `mod/lti/service/gradebookservices`, branch `main`) reads only
`timestamp` and ignores `submission`, but stores the score's `comment` as feedback of the grade, visible in the
gradebook for teachers and for the learner.

## Decision

- **What is measured:** the duration of one attempt of the word choice exercise, from opening the exercise screen to
  finishing it (the step to the result screen), in whole seconds. Decided by the author of the thesis. Time in the word
  list or between attempts does not count. Repeating the exercise opens the screen again, so each attempt has its own
  duration.
- **App:** `WordChoiceExercise` takes the start time when it mounts and passes `durationSeconds` to `ExerciseFinished`
  (an optional route parameter, also on native, where nothing uses it). `useReportResult` sends it with the result:
  `{ "correct", "total", "durationSeconds" }`. The app measures a duration, not points in time, so a wrong clock on the
  device does not matter.
- **lunes-lti:** accepts `durationSeconds` as an optional integer between 0 and one day. Other values are an invalid
  result (`422 invalid_result`). The score gets
  - `submission.startedAt` (finish time minus duration) and `submission.submittedAt` (finish time), the standard fields
    for LMSs that read them;
  - the comment `Bearbeitungszeit: 3 min 12 s`, which Moodle shows as feedback. Decided by the author of the thesis.
    lunes-lti stores no durations.

## Consequences

- Teachers see the time of the latest attempt next to its grade in the Moodle gradebook; earlier attempts are
  overwritten like their grades (0016). The learner sees the same feedback.
- Wall-clock time: an attempt that stays open in a background tab counts in full. Acceptable for an indicator; the
  existing analytics hook `useTrackForegroundDuration` counts only foreground time, but reports on unmount, after the
  result is sent.
- Like the result itself, the duration comes from the browser and can be manipulated (0016).
- Results without `durationSeconds` (older app versions) are still accepted and sent without comment.
- A teacher's own feedback in Moodle is overwritten by the next score of the tool.
- Tested with unit tests in both repositories, the end-to-end test of lunes-lti and in Moodle on 2026-11-12: the user
  report of the course showed the feedback "Bearbeitungszeit: 1 min 35 s" and "Bearbeitungszeit: 31 s" next to the
  grades of two activities (one created with Deep Linking).
