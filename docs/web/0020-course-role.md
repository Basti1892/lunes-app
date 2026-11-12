# 0020: Course role

## Status

Proposed (to be accepted after a launch by a teacher in Moodle)

## Context

FR-01 asks that the app receives the user's LMS identity as a pseudonymous identifier together with the role (teacher
or learner). lunes-lti stored the pseudonymous `sub` (0014) but ignored the roles claim
(`https://purl.imsglobal.org/spec/lti/claim/roles`), so a teacher's launch behaved like a learner's. When a teacher
finished the exercise, lunes-lti sent a score, Moodle rejected it with `400` (it accepts scores only for users it can
grade in the course, `is_user_gradable_in_course`), and the result screen showed the error message.

Roles are URIs, for context roles `http://purl.imsglobal.org/vocab/lis/v2/membership#Learner`, `…#Instructor` and
sub-roles such as `…/membership/Instructor#TeachingAssistant`; LTI 1.3 also allows the short forms `Learner` and
`Instructor`. Institution and system roles (for example a site administrator) describe the person, not the course.

## Decision

- **Role per launch:** lunes-lti maps the roles claim to `instructor` (Instructor, TeachingAssistant, ContentDeveloper
  or Administrator of the course), `learner` (Learner) or `other` (anything else, e.g. Mentor, or only institution
  roles). Instructor wins if both are present. The role is stored with the launch; it is not personal data (NFR-04).
- **Log:** every launch is logged with role, profession and set (`LTI launch: role learner, job 3, unit 7`), without
  the `sub`. The stable pseudonymous `sub` stays in the database of lunes-lti (table `launches`).
- **Teachers preview:** only launches with the role `learner` are graded. For any other role `POST /lti/results`
  answers `409 preview` without contacting the LMS, and the result screen says "Du hast Lunes als Lehrkraft geöffnet.
  Dein Ergebnis wird nicht an den Kurs übertragen." Decided by the author of the thesis.
- The app does not otherwise depend on the role: teachers see the same selected set as learners (FR-06), so they can
  try out the activity as learners experience it.

## Consequences

- FR-01: pseudonymous identity and role reach the tool at every launch and are used.
- Teachers no longer see an error message after trying an activity, and lunes-lti no longer logs Moodle's rejection
  for them.
- People with the role `other` (e.g. a site administrator without a role in the course, a mentor) get the preview
  text, which addresses teachers; acceptable, as they are not graded either.
- Launches stored before this change count as learner launches (database migration with the default `learner`).
- Tested with unit tests and the end-to-end tests of lunes-lti (learner and instructor launches). Not yet tested with
  Moodle.
