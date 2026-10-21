import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { ReactElement } from 'react'

import AnalyticsConsentModal from '../components/AnalyticsConsentModal'
import useStorage from '../hooks/useStorage'
import HomeStackNavigator from './HomeStackNavigator'
import { RoutesParams } from './NavigationTypes'

// On web only the home tab exists (docs/web/0003-minimal-path-and-web-navigators.md), so the tab bar is not shown.
// The navigator is kept so that routes like BottomTabNavigator > HomeTab > Home stay the same as on native.

const Navigator = createBottomTabNavigator<RoutesParams>()

const hideTabBar = (): null => null

const BottomTabNavigator = (): ReactElement | null => {
  const [analyticsConsent, setAnalyticsConsent] = useStorage('analyticsConsent')

  const handleAllow = async (): Promise<void> => {
    await setAnalyticsConsent({ consentGiven: true, consentDate: new Date().toISOString() })
  }

  const handleDecline = async (): Promise<void> => {
    await setAnalyticsConsent({ consentGiven: false, consentDate: new Date().toISOString() })
  }

  return (
    <>
      <AnalyticsConsentModal visible={analyticsConsent === null} onAllow={handleAllow} onDecline={handleDecline} />
      <Navigator.Navigator tabBar={hideTabBar} screenOptions={{ headerShown: false }}>
        <Navigator.Screen name='HomeTab' component={HomeStackNavigator} />
      </Navigator.Navigator>
    </>
  )
}

export default BottomTabNavigator
