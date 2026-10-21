import SourceSansProRegular from '../assets/fonts/SourceSansPro-Regular.ttf'
import SourceSansProSemiBold from '../assets/fonts/SourceSansPro-SemiBold.ttf'

// Registers the fonts of src/constants/theme/fonts.ts. On native they are linked into the app bundle,
// on web every family name needs its own @font-face rule.
const fontFaces = [
  { family: 'SourceSansPro-Regular', url: SourceSansProRegular },
  { family: 'SourceSansPro-SemiBold', url: SourceSansProSemiBold },
]

const style = document.createElement('style')
style.textContent = fontFaces
  .map(
    ({ family, url }) =>
      `@font-face { font-family: '${family}'; src: url(${url}) format('truetype'); font-display: swap; }`,
  )
  .join('\n')
document.head.appendChild(style)
