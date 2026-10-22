import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React, { ReactElement } from 'react'

import HomeStackNavigator from './HomeStackNavigator'
import { RoutesParams } from './NavigationTypes'

// On web only the home tab exists (docs/web/0003-minimal-path-and-web-navigators.md), so the tab bar is not shown.
// The navigator is kept so that routes like BottomTabNavigator > HomeTab > Home stay the same as on native.
// The analytics consent dialog is not shown on web: without an answer, no consent is given, so neither analytics
// events nor error reports are sent (docs/web/0011-error-reporting-web.md).

const Navigator = createBottomTabNavigator<RoutesParams>()

const hideTabBar = (): null => null

const BottomTabNavigator = (): ReactElement => (
  <Navigator.Navigator tabBar={hideTabBar} screenOptions={{ headerShown: false }}>
    <Navigator.Screen name='HomeTab' component={HomeStackNavigator} />
  </Navigator.Navigator>
)

export default BottomTabNavigator
