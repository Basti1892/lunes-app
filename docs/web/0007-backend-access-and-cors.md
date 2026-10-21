# 0007: Backend access and CORS

## Status

Open (needs a decision with Digitalfabrik)

## Context

The app calls the CMS API (`https://lunes.tuerantuer.org/api/v2`, dev: `https://lunes-test.tuerantuer.org/api/v2`,
see `src/services/axios.ts`). It sends custom headers (`X-os`, `X-os-version`, `X-app-version`, optionally
`Authorization`), so every browser request needs a CORS preflight. A check on 2026-10-21 showed that the test CMS
answers the `OPTIONS` preflight with 405 and sends no `Access-Control-*` headers. Browser requests from another
origin are therefore blocked.

## Decision

- Development: the webpack dev server proxies `/api` to the test CMS. On web the API base URL is relative
  (`/api/v2`), provided by a `.web.ts` adapter (see 0002).
- Production: not decided. Options:
  1. Enable CORS in the CMS for the web origin(s) and the custom headers (e.g. `django-cors-headers`).
  2. Serve the web app from the same origin as the API, or behind a reverse proxy that forwards `/api`.
- The app does not work around CORS in code.

## Consequences

- Local development works without backend changes.
- A deployed web version needs one of the production options. This must be agreed with Digitalfabrik.
- Media files (images, audio) are loaded with `<img>` and `<audio>`, which do not need CORS.
