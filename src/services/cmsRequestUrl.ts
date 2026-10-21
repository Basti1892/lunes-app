// The apps call the CMS directly. On web, cmsRequestUrl.web.ts routes requests through the own origin (docs/web/0007).
export const toCmsRequestUrl = (url: string): string => url
