import { AppRegistry } from 'react-native'

import '../web/fonts'
import { name as appName } from './app.json'
import WebPreviewScreen from './routes/WebPreviewScreen'

AppRegistry.registerComponent(appName, () => WebPreviewScreen)
AppRegistry.runApplication(appName, { rootTag: document.getElementById('root') })
