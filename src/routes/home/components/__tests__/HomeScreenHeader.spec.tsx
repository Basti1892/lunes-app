import { NavigationContainer } from '@react-navigation/native'
import { fireEvent } from '@testing-library/react-native'
import React from 'react'

import { Features } from '../../../../constants/features'
import createNavigationMock from '../../../../testing/createNavigationPropMock'
import render from '../../../../testing/render'
import HomeScreenHeader from '../HomeScreenHeader'

const mockFeatures: Features = { menu: true, training: true, repetition: true }

jest.mock('../../../../constants/features', () => ({
  get FEATURES() {
    return mockFeatures
  },
}))

describe('HomeScreenHeader', () => {
  const navigation = createNavigationMock<'Home'>()

  afterEach(() => {
    mockFeatures.menu = true
  })

  it('should open the header overlay', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <HomeScreenHeader navigation={navigation} />
      </NavigationContainer>,
    )

    const menu = getByTestId('menu-icon-white')
    expect(menu).toBeTruthy()

    fireEvent.press(menu)

    expect(navigation.navigate).toHaveBeenCalledWith('OverlayMenu')
  })

  it('should not show the menu if the feature is disabled', () => {
    mockFeatures.menu = false

    const { queryByTestId } = render(
      <NavigationContainer>
        <HomeScreenHeader navigation={navigation} />
      </NavigationContainer>,
    )

    expect(queryByTestId('menu-icon-white')).toBeNull()
  })
})
