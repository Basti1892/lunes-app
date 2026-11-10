import { AppRegistry } from 'react-native'

import '../web/fonts'
import App from './App'
import app from './app.json'
import { takeTokenFromUrl } from './services/ltiSession'

// Embedded mode after an LTI launch: move the session token out of the URL before navigation reads it (docs/web/0015)
try {
  takeTokenFromUrl(window.location, window.history, window.sessionStorage)
} catch {
  // Storage blocked by the browser: the app starts standalone
}

AppRegistry.registerComponent(app.name, () => App)
AppRegistry.runApplication(app.name, { rootTag: document.getElementById('root') })
