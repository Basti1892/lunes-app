# 0019: Withdrawn vocabulary sets

## Status

Accepted (decision D-02 of the thesis; tested in Moodle on 2026-11-12, TC-11)

## Context

An LMS activity stores only the IDs of a profession and a vocabulary set (0017). If the set is later withdrawn in the
CMS (deleted, unpublished, or its profession withdrawn), the activity still points to it. FR-07 asks that the
integration resolves the reference or reports why it cannot. Until now, the launch redirected anyway, and the app failed
while loading the set without saying why; the LMS learned nothing.

The test CMS answers `403` for a profession it does not offer and leaves withdrawn sets out of the list of a profession
(`/jobs/<id>/units`). LTI defines the parameters `lti_errormsg` and `lti_msg` for the return URL of the launch; Moodle
shows `lti_errormsg` on its return page (`mod/lti/return.php`), without logging it.

Changed sets need nothing: the app loads the content from the CMS at every launch (NFR-08). Only the activity name in
Moodle keeps the title the set had when it was chosen.

## Decision

- **Check at launch:** after validating the launch, lunes-lti asks the CMS whether the profession still offers the set
  (`find_unit` in `cms.py`). Decided by the author of the thesis, as proposed in D-02.
- **Withdrawn set:** no launch is stored and no session token is issued. lunes-lti shows "Dieses Vokabelset gibt es in
  Lunes nicht mehr. Lehrkräfte können in den Einstellungen der Aktivität mit „Inhalt auswählen“ ein anderes Vokabelset
  wählen." in place of the app. The same page serves learners and teachers, so it needs no role. lunes-lti logs the
  IDs.
- **No error return to the LMS** (decided by the author of the thesis after the test in Moodle). The page has no link
  to the return URL with `lti_errormsg`: Moodle shows that parameter on its own return page, which in the launch
  container "Embed, without blocks" opens without any course navigation, a dead end with a second error message. Without
  the link, the learner stays on the course page and continues with its navigation.
- **CMS not reachable** (timeout of 3 seconds, network or server error) or no `cms_url` configured: the launch goes
  ahead as before. Launches keep working while the CMS is slow (NFR-06); the app shows its own loading error then.

## Consequences

- FR-07 is met for withdrawn sets and professions by reporting why the reference cannot be resolved: learners and
  teachers see the reason and what the teacher can do, inside the course page.
- The LMS itself receives no message and records nothing (Moodle would not record `lti_errormsg` either), so a teacher
  notices a withdrawn set only by launching the activity or through learners. The operator finds the IDs in the log of
  lunes-lti.
- Every launch makes one more request to the CMS (one list of sets), usually well below a second.
- A set withdrawn during a session is not detected; the app fails when it next loads the set.
- Tested with unit tests, the end-to-end test of lunes-lti and in Moodle on 2026-11-12 (TC-11, student, embedded, an
  activity with a `unit_id` the CMS does not offer): the iframe showed the explanation. A first version linked back
  with `lti_errormsg`; Moodle's return page showed the reason, but without course navigation, which led to the decision
  above.
