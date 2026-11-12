# 0022: Settings per activity

## Status

Accepted (decision D-03 of the thesis; activity form and completion checked in Moodle on 2026-11-12)

## Context

FR-09 asks that teachers configure the behaviour of the integration independently for each course: grading weight,
deadlines, retry attempts, notifications and which learning modes must be completed. D-03 proposed using Moodle's own
settings of the External tool activity and custom parameters only where needed.

Settings of an External tool activity in Moodle (checked in the source, `mod/lti/mod_form.php`, `mod/lti/lib.php` and
`course/moodleform_mod.php`, branch `main`):

- Name, description, display of name and description in the embedded launch, custom parameters (advanced).
- **Grade** (shown when the tool accepts grades): maximum grade, grade category, grade to pass. The weight of the
  activity in the course total is set in the gradebook setup of the course.
- **Activity completion** (common settings): complete when viewed, when a grade is received or a passing grade is
  received (Moodle offers these for modules with grades), and an "Set reminder in Timeline" date that appears in the
  calendar and timeline of the learners.
- **Restrict access** (common settings): from and until dates, grade conditions on other activities, groups and more.
- mod_lti has no due date, no setting for attempts and no group mode.

Lunes itself: only the word choice exercise produces a result (0016); every finished attempt is sent, and Moodle keeps
the latest. The activity stores the vocabulary set as custom parameters (`job_id`, `unit_id`, 0017).

## Decision

Decided by the author of the thesis, following D-03.

- **Per-activity settings are Moodle's settings.** lunes-lti adds no settings page and reads no further custom
  parameters. Each activity in each course has its own Moodle settings, so they are independent per course.
- The aspects of FR-09:

  | Aspect                     | How it is configured                                                                                                                                                                                           | Met    |
  | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
  | Grading weight             | Maximum grade and grade to pass of the activity (Deep Linking sets the maximum to 100 at creation; change it before the first grades, Moodle locks it afterwards); weight and category in the gradebook setup. | yes    |
  | Deadlines                  | No due date in mod_lti. "Set reminder in Timeline" for the calendar; "Restrict access" until a date: no new launches afterwards (an open session can still be finished, up to 2 hours).                        | partly |
  | Retry attempts             | Not configurable. Every attempt is sent, the latest counts (0016). A limit would need lunes-lti to count attempts per learner.                                                                                 | no     |
  | Notifications              | Not configurable in the integration. Moodle's own calendar and timeline entries from "Set reminder in Timeline" and its course notifications apply.                                                            | no     |
  | Learning modes to complete | Not configurable. Only the word choice exercise produces a result; completion "Receive a grade" means it was finished at least once.                                                                           | partly |

- **No custom parameters for behaviour for now.** Attempt limits or required learning modes would mean storing
  attempts or progress per learner in lunes-lti (against the minimal storage of 0014 and NFR-04) or sending results of
  the word list, which has no score. They are left for later.

## Consequences

- FR-09 is partly met: grading and access by date are configurable per activity with standard Moodle settings, without
  coding (NFR-05). Retry attempts, notifications and required learning modes are not.
- Teachers need no Lunes-specific knowledge for these settings; the registration guide of lunes-lti lists them.
- Changing the maximum grade in Moodle does not change what Lunes sends: Moodle scales the score (words correct out of
  all words) to the maximum grade.
- Inspected in the activity form on moodle-lunes.tuerantuer.org on 2026-11-12: "Grade" with type Point, maximum grade
  100, grade category and grade to pass; once grades exist, Moodle does not allow changing the type and shows the
  maximum locked. "Restrict access" offers date, grade, user profile and restriction sets.
- The form also has the sections "Common module settings", "Completion conditions" (named so in this Moodle version;
  shown only when completion tracking is enabled in the course), "Tags" and "Competencies". "Completion conditions" →
  "Add requirements" offers "View the activity" and "Receive a grade" (any grade or passing grade); the reminder date
  is called "Set reminder in Timeline". With "Receive a grade", a student's activity showed "Erledigt: Eine Bewertung
  erhalten" after Lunes had sent the grade. Saving the completion settings recalculates completion for existing
  grades.
