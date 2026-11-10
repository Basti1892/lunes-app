import { NavigationContainer } from '@react-navigation/native'
import { screen } from '@testing-library/react-native'
import React, { ReactElement } from 'react'
import { Text } from 'react-native'

import { EmbeddedMode, EmbeddedModeContext } from '../../services/EmbeddedModeService'
import render from '../../testing/render'
import HomeStackNavigator from '../HomeStackNavigator.web'

// jest.setup.ts reduces this module to useHeaderHeight; the stack navigator needs the real one
jest.mock('@react-navigation/elements', () => jest.requireActual('@react-navigation/elements'))
jest.mock('../../routes/home/HomeScreen', () => ({
  __esModule: true,
  default: (): ReactElement => <Text>Home</Text>,
}))
jest.mock('../../routes/exercises/StandardExercisesScreen', () => ({
  __esModule: true,
  default: ({ route }: { route: { params: { jobId: number; unitId: number } } }): ReactElement => (
    <Text>{`Unit ${route.params.jobId}/${route.params.unitId}`}</Text>
  ),
}))

const renderStack = (embeddedMode: EmbeddedMode) =>
  render(
    <EmbeddedModeContext.Provider value={embeddedMode}>
      <NavigationContainer>
        <HomeStackNavigator />
      </NavigationContainer>
    </EmbeddedModeContext.Provider>,
  )

describe('HomeStackNavigator (web)', () => {
  it('should start with the home screen when standalone', () => {
    renderStack({ type: 'standalone' })

    expect(screen.getByText('Home')).toBeTruthy()
  })

  it('should only show the selected unit without a way back in the embedded mode', () => {
    renderStack({ type: 'active', session: { jobId: 47, unitId: 304, returnUrl: null, expiresAt: 1 } })

    expect(screen.getByText('Unit 47/304')).toBeTruthy()
    expect(screen.queryByText('Home')).toBeNull()
    // The label of the header back button ("Einheiten")
    expect(screen.queryByText(/einheiten/i)).toBeNull()
  })
})
