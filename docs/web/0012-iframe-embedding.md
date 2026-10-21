# 0012: Iframe embedding

## Status

Proposed

## Context

The web version is to be embedded in an iframe on an LMS course page, possibly linking straight to a profession or
vocabulary set (see 0008).

## Decision

- The production build supports a configurable `publicPath` so it can be hosted under a subpath.
- The hosting server must provide:
  - an SPA fallback (unknown paths serve `index.html`), so deep links and reloads work;
  - a `Content-Security-Policy: frame-ancestors` header that allows the LMS origin(s), and no
    `X-Frame-Options: DENY` for the web app;
  - backend access as described in 0007.
- The LMS embeds the app with `<iframe src="https://<host>/jobs/<jobId>/units/<unitId>" allow="autoplay">`.
- `web/iframe-test.html` is used to test storage, audio, speech synthesis and deep links inside an iframe.

## Consequences

- Hosting is a separate deliverable from the app code.
- Storage limits in third-party iframes apply (see 0009).
