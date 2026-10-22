# 0012: Iframe embedding

## Status

Accepted (step 8). Not yet checked in Safari, see Consequences.

## Context

The web version is to be embedded in an iframe on an LMS course page, possibly linking straight to a profession or
vocabulary set (see 0008). The LMS runs on another site than Lunes, so the iframe is cross-site: browsers partition
its storage and require permissions for some APIs. The web version may also have to be hosted under a subpath of a
domain that serves other tools.

## Decision

- **Base path.** The environment variable `LUNES_BASE_PATH` (e.g. `/lunes`, empty by default) sets the path the web
  version is hosted under. Everything lives below it: the app routes (`/lunes/jobs/1`), the assets (webpack
  `publicPath`) and the API proxy (`/lunes/api`). The app reads it from `src/constants/webBasePath.ts`.
  - Bash on Windows (Git Bash) turns `/lunes` into a Windows path; use PowerShell
    (`$env:LUNES_BASE_PATH='/lunes'; yarn web:build`). The webpack config fails if the value does not start with `/`.
- **Hosting requirements** for the server that serves `build/web`:
  - an SPA fallback: unknown paths below the base path serve `index.html`, so links and reloads work;
  - `Content-Security-Policy: frame-ancestors <LMS origins>` and no `X-Frame-Options: DENY` for the app;
  - a proxy from `<base path>/api` to the CMS, or CORS in the CMS (see 0007).
- **Embedding:** `<iframe src="https://<host><base path>/jobs/<jobId>/units/<unitId>" allow="autoplay; web-share">`.
  `allow="web-share"` is needed for the share button (0004 / step 6), `autoplay` is not needed for playback on button
  press but does no harm.
- **Test page:** `web/iframe-test/index.html`, served only by the dev server. It mocks an LMS course page. Opened via
  `http://127.0.0.1:8080/iframe-test/index.html`, it embeds the app from `http://localhost:8080`, which is a different
  site, so the iframe behaves like in an LMS.

## Consequences

- Verified in step 8 (same-origin iframe, built-in browser of the development environment): direct links, navigation
  and URL updates inside the iframe without changing the URL of the course page, audio playback, German TTS voices.
- Verified with `LUNES_BASE_PATH=/lunes`: production build, direct links, reload, header back, browser back and forward,
  API requests through `/lunes/api`, fonts.
- Verified manually in a cross-site iframe (test page via `127.0.0.1`, app via `localhost`) in a desktop browser on
  Windows: the selected profession survives a reload (partitioned storage works), audio plays, a unit link opens the
  exercises of the unit.
- Open: Safari (storage limits of ITP, see 0009).
- The browser automation of the development environment cannot click into cross-site iframes (they run in another
  process), so the cross-site case has to be checked by hand with the test page.
- In a cross-site iframe, browsers partition localStorage by top-level site, and Safari may delete it after 7 days
  (0009). Progress is therefore stored per LMS site and browser.
- Navigation inside the iframe adds entries to the session history of the course page, so the browser back button
  of the LMS page navigates inside Lunes first.
