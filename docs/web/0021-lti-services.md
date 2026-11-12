# 0021: LTI services used

## Status

Accepted (decision D-01 of the thesis; matches the registration and the implementation of lunes-lti)

## Context

Besides the launch, LTI 1.3 offers optional services. The ones Moodle offers for an external tool are:

- **Deep Linking 2.0:** the teacher selects content of the tool when adding an activity.
- **Assignment and Grade Services (AGS) 2.0:** the tool sends scores to the gradebook; with more rights it can also
  read results and create or change grade items ("line items").
- **Names and Role Provisioning Services (NRPS) 2.0:** the tool can fetch the member list of the course at any time:
  the user IDs and roles of all participants and, depending on the privacy settings of the tool, names and e-mail
  addresses.
- **Tool Settings:** the LMS stores settings on behalf of the tool.

NFR-04 allows only the data needed to attribute results to the right learner and course context to cross the system
boundary, each item with an identifiable purpose. Section 5.3 of the thesis requires deciding which services beyond
launch, Deep Linking and AGS are used and arguing the omission of NRPS with NFR-04 (obligation OB-02).

## Decision

Decided by the author of the thesis.

- **Used:**
  - **Launch:** pseudonymous user ID, course role (0020), course and resource link, the IDs of the vocabulary set as
    custom parameters, the AGS endpoint and the return URL. Names and e-mail addresses are not shared (privacy settings
    of the tool: "Never"); lunes-lti drops the `ext` and `lis` claims Moodle still sends (0014).
  - **Deep Linking** for selecting the vocabulary set (FR-05, 0017).
  - **AGS, scores only** ("Use this service for grade sync only" in Moodle): lunes-lti sends one score per finished
    attempt of a learner to the line item of the activity (FR-03, FR-16, 0016, 0018). It does not read results and does
    not create or change line items; Moodle creates the grade item from the Deep Linking response.
- **Not used:**
  - **NRPS** ("Do not use this service"). Everything the tool needs about a person arrives with that person's own
    launch: the pseudonymous ID to attribute the score and the role to decide whether it is graded (FR-01). The member
    list would move the whole course across the system boundary, including participants who never open Lunes, without
    serving a requirement (NFR-04).
  - **Tool Settings** ("Do not use this service"): Lunes keeps no settings per course or activity. The vocabulary set is
    stored in the activity as custom parameters, grade settings stay in Moodle.

## Consequences

- Per launch, only data of the person who opens the activity crosses the boundary; lunes-lti stores it only for the
  lifetime of the session (0014). Lunes knows nothing about participants who have not opened it.
- Overviews of participation and results are in the Moodle gradebook, not in Lunes. A list of learners who have not yet
  practised, or reminders to them, would need NRPS and a new decision against NFR-04.
- lunes-lti calls only the score endpoint of AGS. PyLTI1p3 requests its access token with all AGS scopes the LMS offers
  in the launch, so the token may allow more (e.g. reading results); the setting "grade sync only" in Moodle keeps that
  to the minimum Moodle offers. NRPS stays unused even if it is switched on in Moodle by mistake, because lunes-lti
  never reads the member list.
- Registration: the service settings in the registration guide of lunes-lti (`docs/moodle-registration.md`) implement
  this decision.
