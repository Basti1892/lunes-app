import { NavigationContainer } from '@react-navigation/native'
import React, { ReactElement } from 'react'
import { LogBox } from 'react-native'
import 'react-native-gesture-handler'
import { PaperProvider } from 'react-native-paper'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from 'styled-components/native'

import EmbeddedModeNotice from './components/EmbeddedModeNotice'
import theme from './constants/theme'
import Navigator from './navigation/Navigator'
import deepLinking from './navigation/deepLinking'
import EmbeddedModeProvider from './services/EmbeddedModeService'
import ReducedMotionServiceProvider from './services/ReducedMotionService'
import StorageProvider from './services/Storage'
import TtsServiceProvider from './services/TtsService'
import VolumeServiceProvider from './services/VolumeService'
import { initSentry } from './services/sentry'

LogBox.ignoreLogs(['NativeEventEmitter'])

const App = (): ReactElement => {
  initSentry()

  LogBox.ignoreLogs(['EventEmitter.removeListener'])

  return (
    <ThemeProvider theme={theme}>
      <PaperProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <StorageProvider>
            <VolumeServiceProvider>
              <TtsServiceProvider>
                <ReducedMotionServiceProvider>
                  <EmbeddedModeProvider>
                    <EmbeddedModeNotice />
                    <NavigationContainer linking={deepLinking}>
                      <Navigator />
                    </NavigationContainer>
                  </EmbeddedModeProvider>
                </ReducedMotionServiceProvider>
              </TtsServiceProvider>
            </VolumeServiceProvider>
          </StorageProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </ThemeProvider>
  )
}

export default App
