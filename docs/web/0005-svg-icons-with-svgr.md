# 0005: SVG icons with SVGR

## Status

Accepted

## Context

The icons in `assets/images` are imported as React components through `react-native-svg-transformer` (Metro) and
recolored with a single `color` prop that feeds `fill="currentColor"` (see docs/conventions.md). 30 icons use
`currentColor`, 22 have their colors baked in.

## Decision

- Use `@svgr/webpack` in the webpack config with the DOM target (not the `native` target).
- The `color` prop becomes the CSS `color` of the `<svg>` element, so `fill="currentColor"` keeps working.
- `src/@types/assets.d.ts` stays unchanged (`ComponentType<SvgProps>`).

## Consequences

- No changes to the SVG files or to the call sites.
- On web the icons are plain DOM `<svg>` elements, not `react-native-svg` components. Props that only exist in
  `react-native-svg` are ignored.
