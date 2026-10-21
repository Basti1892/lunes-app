// The CMS sends no CORS headers, so browsers block direct requests (docs/web/0007).
// Requests go to the own origin instead, where the dev server (or a reverse proxy) forwards /api to the CMS.
export const toCmsRequestUrl = (url: string): string => {
  const { pathname, search } = new URL(url)
  return `${pathname}${search}`
}
