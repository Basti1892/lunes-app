import { WEB_BASE_PATH } from '../constants/webBasePath'

// The CMS sends no CORS headers, so browsers block direct requests (docs/web/0007).
// Requests go to the own origin instead, where the dev server (or a reverse proxy) forwards /api to the CMS.
// If the web version is hosted under a base path, the API is expected below it as well (docs/web/0012).
export const toCmsRequestUrl = (url: string): string => {
  const { pathname, search } = new URL(url)
  return `${WEB_BASE_PATH}${pathname}${search}`
}
