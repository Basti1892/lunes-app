import { AppRegistry } from 'react-native'

import '../web/fonts'
import App from './App'
import app from './app.json'

AppRegistry.registerComponent(app.name, () => App)
AppRegistry.runApplication(app.name, { rootTag: document.getElementById('root') })
