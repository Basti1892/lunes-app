# 0005: SVG icons with SVGR

## Status

Accepted

## Context

The icons in `assets/images` are imported as React components through `react-native-svg-transformer` (Metro) and
recolored with a single `color` prop that feeds `fill="currentColor"` (see docs/conventions.md). 30 icons use
`currentColor`, 22 have their colors baked in.

Call sites pass React Native props to the icons: `testID`, `accessibilityLabel`, `onPress` and `style`. Icons
wrapped with `styled(...)` from `styled-components/native` (e.g. `MenuIconWhite` in `HomeScreenHeader.tsx`) receive
`style` as an array. A plain DOM `<svg>` rejects style arrays and does not know `testID`.

## Decision

- Use `@svgr/webpack` with the `native` target, which produces the same output as `react-native-svg-transformer`:
  `react-native-svg` components.
- On web these components render through `react-native-svg`'s web implementation, which creates its elements with
  react-native-web. Style arrays, `testID` (→ `data-testid`) and accessibility props work as on native.
- The `color` prop is passed to the `<svg>` element as the CSS `color`, so `fill="currentColor"` keeps working.
- `src/@types/assets.d.ts` stays unchanged (`ComponentType<SvgProps>`).

The first draft of this ADR chose SVGR's DOM target. That was changed during step 2 because of the props above.

## Consequences

- No changes to the SVG files or to the call sites.
- `react-native-svg` is part of the web bundle.
- Verified in step 2 with icons in two colors, an icon with baked-in colors, a `styled(...)` icon and the icon in
  `Button`.
