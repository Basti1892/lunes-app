# 0017: Deep Linking

## Status

Accepted (first activity created with Deep Linking in Moodle and launched on 2026-11-12)

## Context

ADR 0013 decided that teachers select the vocabulary set inside the LMS with LTI Deep Linking; the LMS stores only the
IDs, the content stays in the CMS (FR-05, NFR-08). Until now the IDs had to be typed as custom parameters of the
activity (0014), which needs the URL of the web app and is error-prone. With Deep Linking, the LMS sends an
`LtiDeepLinkingRequest` to the tool when a teacher adds an activity ("Select content"), shows the tool's page in a
dialog and expects a signed `LtiDeepLinkingResponse` with the chosen content.

The picker could live in lunes-lti (a small server-rendered page) or in the web app (a picker mode reusing the
profession and set screens).

## Decision

- **Picker in lunes-lti**, decided by the author of the thesis. A server-rendered page in German: profession (select
  list), then the sets of that profession with their number of words (radio buttons), then "Auswählen". The web app
  stays unchanged; the picker is teacher-facing and small, so its own simple look is acceptable for the prototype.
- **Content from the CMS:** lunes-lti reads the public professions and sets from the CMS API (`/jobs`,
  `/jobs/<id>/units`) with the Python standard library (no new dependency). The CMS is configured as `cms_url` and has
  to be the one the web app uses, because the IDs differ between CMS instances. Sets of content areas (code and API
  key) are not offered.
- **Flow:** the Deep Linking request arrives at the launch URL; after validation, lunes-lti shows the picker directly
  (no redirect, no further cookies). The picker keeps its state in a token signed with the token secret, valid for one
  hour, with its own audience so it cannot be used as a session token and vice versa. It contains issuer, client,
  deployment, return URL and the opaque `data` of the LMS, nothing about the teacher. The steps post to
  `/lti/deep-link`. The chosen set is checked against the CMS (it must belong to the chosen profession).
- **Response:** one `ltiResourceLink` with the launch URL, the set title as title, the custom parameters `job_id` and
  `unit_id` (the ones the launch already reads, so manual activities keep working) and a line item with
  `scoreMaximum: 100`, so Moodle creates the grade item. lunes-lti signs it with the tool key and the same `kid` as the
  JWKS (PyLTI1p3 sends none, like for the token request in 0016) and posts it with an auto-submitting form to the
  return URL of the LMS.

## Consequences

- Teachers no longer need IDs; Moodle fills in the activity name, the custom parameters and the grade item. Custom
  parameters by hand remain possible (registration guide).
- lunes-lti depends on the CMS being reachable while a teacher picks a set; launches do not.
- The picker shows only titles and numbers of words, not the words themselves. A preview could link to the web app
  later.
- One set per activity, also if the LMS accepts several items.
- Moodle registration: "Supports Deep Linking" on, "Content Selection URL" `<base>/lti/launch`.
- Tested with the simulated LMS of lunes-lti (unit tests, end-to-end test with signature, `kid`, content and
  `data`) and in Moodle: activity created with "Select content" and launched.
