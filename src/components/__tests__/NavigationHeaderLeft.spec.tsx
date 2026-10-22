import { fireEvent } from '@testing-library/react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { ReactTestRendererJSON } from 'react-test-renderer'

import render from '../../testing/render'
import NavigationHeaderLeft from '../NavigationHeaderLeft'

describe('NavigationHeaderLeft', () => {
  const onPress = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should call onPress', () => {
    const { getByText } = render(<NavigationHeaderLeft onPress={onPress} title='Back' isCloseButton={false} />)

    fireEvent.press(getByText('Back'))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('should not let the icon receive presses, because it is replaced while pressed', () => {
    const { toJSON } = render(<NavigationHeaderLeft onPress={onPress} title='Back' isCloseButton />)

    const button = toJSON() as ReactTestRendererJSON
    const iconContainer = button.children?.[0] as ReactTestRendererJSON
    expect(StyleSheet.flatten(iconContainer.props.style)).toMatchObject({ pointerEvents: 'none' })
  })
})
