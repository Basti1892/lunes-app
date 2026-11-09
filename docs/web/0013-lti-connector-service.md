# 0013: LTI connector as a separate service

## Status

Accepted (start of the LTI work, branch `lti-moodle`). The library choice is checked with the first working launch,
see Consequences.

## Context

The web version is to be launched from an LMS course page (Moodle first) as an LTI 1.3 tool: the LMS passes a
pseudonymous learner identity and role at launch, teachers select content inside the LMS (Deep Linking), and results
flow back into the LMS gradebook (Assignment and Grade Services, AGS). The requirements come from the requirements
catalogue of the master's thesis (RQ1); this ADR refers to them by their IDs.

An LTI 1.3 launch cannot be handled by the static web app alone. The LMS starts an OpenID Connect login at the tool,
then sends the launch as a form POST with a signed token (JWT). The tool has to receive the POST, verify the signature
against the LMS's public keys, check state and nonce, and later call AGS with its own private key. None of this can be
done securely in the browser.

Options for where the server side lives:

1. **A Moodle plugin** that contains the app logic. Rejected: schools cannot install plugins in centrally administered
   LMS instances (NFR-14), a plugin has to follow every LMS release, and it ties the integration to one LMS (NFR-01,
   NFR-02).
2. **An extension of lunes-cms** (Django). Keeps the app logic outside the LMS, like option 3. But LTI code would
   enter the core of the CMS, which serves the native apps as well, and every change would follow the CMS release
   cycle, which is not under the control of this project.
3. **A separate service** between the LMS and Lunes.

## Decision

- **Separate service `lunes-lti`** (option 3), in its own repository. It is the only component that speaks LTI.
  Lunes CMS and the native apps stay unchanged; the web app only gains an embedded mode.
  - On NFR-02: its value scale measures whether the app logic ends up inside the LMS, so options 2 and 3 reach the
    same level. The separate service is chosen on top of that because it also keeps the Lunes core free of the
    connector (the wording "changes in either system do not cascade into the core of the other"), leaves standalone
    use untouched (NFR-11), and can be developed and deployed independently. If the CMS should host LTI later, the
    service is a self-contained unit to move.
- **Same origin as the web app.** The service runs on the host of the web version below `/lti/`, next to the `/api/`
  proxy (0007, 0012). The app talks to it without CORS, and no third-party cookies are needed between app and service.
- **Responsibilities of the service:**
  - OIDC login initiation and launch (`/lti/login`, `/lti/launch`), JWKS of the tool (`/lti/jwks`);
  - Deep Linking: the teacher picks a profession and vocabulary set; the LMS stores only their IDs, the content stays
    in the CMS (FR-05, NFR-08);
  - after the launch, a redirect into the app (`/jobs/:jobId/units/:unitId`) restricted to the selected set (FR-06);
  - receiving results from the app and sending them to the gradebook immediately via AGS (FR-03, NFR-15), including
    timestamps for time on task (FR-16).
- **Session between app and service.** The service issues its own short-lived, signed session token, not the LMS
  token. It is passed in the URL fragment of the redirect (not sent to servers, not logged), kept in `sessionStorage`
  and removed from the URL (NFR-09). The app sends results with it; when it has expired, the app says that the
  activity has to be started again from the LMS (FR-11).
- **Data minimisation.** The service stores the platform registration, its key pair, state and nonce, and per launch
  the pseudonymous user ID (`sub`), course context and AGS line item. No names or e-mail addresses; the tool is
  registered in the LMS without sharing them (NFR-04, NFR-10). No account in Lunes (NFR-10).
- **App side (branch `lti-moodle`, from `web-version`).** An embedded mode that is active only after an LTI launch:
  reading the session token, hiding navigation outside the selected set, reporting the result when a learning mode is
  finished (`ExerciseFinished`, FR-12), showing the submission state (FR-11) and a link back to the course from the
  launch's return URL (FR-13). Without a launch the web version behaves as before (NFR-11).
- **Technology.** Python with the open source library `pylti1.3` (launch, Deep Linking, AGS; NFR-07). Python matches
  the stack Digitalfabrik already runs (lunes-cms). Considered: `ltijs` for Node.js, which requires MongoDB, too much
  infrastructure for this prototype.

## Consequences

- A second component to build, deploy and maintain: its own repository, a Python runtime and a systemd service on the
  web host, added to the salt state of the web version in a later pull request.
- The tool's private key lives only on the server (provisioned by salt), never in a repository.
- The LMS registration needs a site administrator of the Moodle instance (tool URL, login URL, JWKS URL, redirect URL,
  privacy settings).
- Risk: the OIDC login runs inside the cross-site iframe of the course page. The state check of LTI 1.3 usually relies
  on a cookie, which browsers block or partition in third-party contexts. To be checked with the first launch; options
  are the cookie check of `pylti1.3` with a fallback to a new window, or opening the activity in a new window.
- Results only reach the gradebook while the session token is valid. Offline buffering (FR-08) is not part of the
  first version.
- Dependencies of the service are added by the developer (Nortal policy), like those of the app.
