// Path under which the web version is hosted, e.g. '/lunes', or '' at the root of a domain (docs/web/0012).
// Set with the environment variable LUNES_BASE_PATH when running webpack (web/webpack.config.js).
// Only used by the web version.
export const WEB_BASE_PATH: string = process.env.LUNES_BASE_PATH ?? ''
