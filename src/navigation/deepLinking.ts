import { LinkingOptions } from '@react-navigation/native'

import { RoutesParams } from './NavigationTypes'

// Deep links of the apps (docs/deep-linking.md). The web version has its own config in deepLinking.web.ts.
const deepLinking: LinkingOptions<RoutesParams> = {
  prefixes: ['lunes://lunes.app', 'https://lunes.tuerantuer.org'],
  config: {
    screens: {
      Activation: 'activation/:code',
    },
  },
}

export default deepLinking
