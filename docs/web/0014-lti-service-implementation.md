# 0014: Implementation of the LTI service

## Status

Accepted (first launch from moodle-lunes.tuerantuer.org on 2026-11-10, see Consequences)

## Context

ADR 0013 decided on a separate Python service `lunes-lti` with PyLTI1p3 (PyPI name `PyLTI1p3`, version 2.0). Open
were the web framework, the storage, the configuration, how the vocabulary set reaches the launch before Deep Linking
exists, and the risk of blocked cookies during the login in the cross-site iframe.

PyLTI1p3 2.0 binds the OIDC state to the browser with a cookie (`lti1p3-state-…`) and, when a launch data storage is
used, a session cookie (`lti1p3-session-id`). Its Flask adapter sets `Secure; SameSite=None` only if Flask sees an
HTTPS request. It caches the whole launch token, which in Moodle contains the username (`ext` claim), the ID number
(`lis` claim) and, depending on the privacy settings, name and e-mail.

## Decision

- **Flask** with the Flask adapter of PyLTI1p3. The service has three endpoints and no UI; Flask keeps the dependencies
  at Flask, PyLTI1p3 and gunicorn (server only). Considered: Django, closer to lunes-cms and with an admin for
  registrations, but more framework than the service needs. If the CMS hosts LTI later (option 2 of 0013), the
  service is small enough to port.
- **Storage: SQLite** through the Python standard library, one file in the data directory: a launch data storage for
  PyLTI1p3 (nonce, state, cached launch; two hours) and a `launches` table (pseudonymous `sub`, course, resource
  link, AGS line item, job and unit). No Redis or cache server.
- **Nonce used once:** PyLTI1p3 2.0 only checks that the nonce of a launch exists in the launch data storage and keeps
  it until it expires, so the same id_token and state could be launched again from the same browser within two hours.
  lunes-lti deletes the nonce once a launch has passed all checks (`SessionService.consume_nonce`, called from
  `MessageLaunch.save_launch_data`). Found while writing the tests for TC-09 on 2026-11-12 (NFR-03).
- **Configuration: a TOML file** without secrets (`base_url`, `data_dir`, token lifetime, one `[[platforms]]` entry per
  LMS registration). Salt can render it from the pillar.
- **Key material generated at runtime** in the data directory: the tool's RSA key pair (published at `/lti/jwks`) and
  the HMAC secret of the session tokens. Never in a repository.
- **Cookies:** always `Secure; SameSite=None; Partitioned; HttpOnly`, path `<base path>/lti/`, independent of the
  scheme Flask sees (TLS ends at nginx, and in development at the webpack dev server). `Partitioned` (CHIPS) keeps the
  cookies working in the LMS iframe in browsers that block unpartitioned third-party cookies: login and launch run in
  the same iframe under the same top-level site. PyLTI1p3's cookie check stays on: if cookies are blocked, the login
  offers to open Lunes in a new tab.
- **Data minimisation:** personal claims (name, e-mail and the other OIDC profile claims, `ext`, `lis`, `lti1p1`) are
  removed before PyLTI1p3 caches the launch. The tool is registered without sharing name and e-mail.
- **Vocabulary set before Deep Linking:** custom parameters of the Moodle activity, `job_id` and `unit_id`. The launch
  redirects to `/jobs/<job_id>/units/<unit_id>#lti_token=<token>`.
- **Session token:** HS256 JWT with only the launch ID (`lid`), `iat` and `exp` (default two hours).
- **Development:** the webpack dev server proxies `<base path>/lti` to `http://127.0.0.1:5000` (`LUNES_LTI_ORIGIN`), so
  app and service share an origin as in production. Moodle is registered with `http://localhost:8080`; the public key
  is pasted as "RSA key", because Moodle cannot fetch the JWKS from localhost.

## Consequences

- The web app does not read the token yet; it stays in the URL fragment until the embedded mode of 0013 stores it in
  `sessionStorage` and removes it from the URL.
- The JWKS has no `kid` (PyLTI1p3 derives the key from the PEM without one). To be checked with AGS, where Moodle
  verifies the tool's signed token request.
- Verified on 2026-11-10 on Windows: launched by a student account in Chrome, Edge and Firefox, and by a teacher
  account in Edge. An activity in a test course on moodle-lunes.tuerantuer.org (launch container "Embed", development
  setup with `base_url` `http://localhost:8080`) launches the tool in the course page iframe. The app opens the
  selected vocabulary set; word list, exercise and result screen work inside the iframe. The partitioned login cookies
  survived the cross-site launch, the cookie check page was not needed.
- Verified on 2026-11-11 in an InPrivate window of Edge, which blocks third-party cookies: the cookie check page
  appears in the iframe ("Dein Browser erlaubt keine Cookies in eingebetteten Inhalten"), and its link opens Lunes in
  a new tab, where the launch works as a first-party page.
- Still open: Safari and the deployed service over HTTPS.
- In development, Chrome and Edge ask once per Moodle site for permission to access apps and services on the device
  (Local Network Access), because a public site embeds `localhost`. The deployed service on a public host does not
  trigger it.
- Safari partitions cookies differently and is not supported for local development over `http://localhost`.
- Deployment (venv, gunicorn as a systemd service, nginx `location /lti/`, config from the pillar) is added to the
  `lunes-webapp` salt state in the bundled pull request.
- Automated end-to-end tests (`keys` marker) show that a launch signed with another key and a replayed launch are
  rejected without storing a launch (TC-09), next to the existing tests for missing login cookies and invalid session
  tokens.
