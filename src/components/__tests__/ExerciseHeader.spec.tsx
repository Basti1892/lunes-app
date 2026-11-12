import { act, fireEvent } from '@testing-library/react-native'
import React, { ReactElement } from 'react'
import { BackHandler } from 'react-native'

import { StandardExerciseKeys } from '../../constants/data'
import { VocabularyItemTypes } from '../../models/VocabularyItem'
import { EmbeddedMode, EmbeddedModeContext } from '../../services/EmbeddedModeService'
import { getLabels } from '../../services/helpers'
import createNavigationMock from '../../testing/createNavigationPropMock'
import render from '../../testing/render'
import ExerciseHeader from '../ExerciseHeader'

jest.useFakeTimers()

const backHandlerListeners: { [key: string]: (() => boolean)[] } = {}

jest.mock('react-native/Libraries/Utilities/BackHandler', () => ({
  default: {
    addEventListener: jest.fn((event: string, handler: () => boolean) => {
      backHandlerListeners[event] = []
      backHandlerListeners[event].push(handler)
      return { remove: jest.fn() }
    }),
    mockPressBack: jest.fn(() => {
      backHandlerListeners.hardwareBackPress!.forEach(h => h())
    }),
  },
}))

jest.mock('../AudioPlayer', () => () => null)

describe('ExerciseHeader', () => {
  const navigation = createNavigationMock<'WordChoiceExercise'>()

  it('should render header', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <ExerciseHeader
        navigation={navigation}
        currentWord={4}
        numberOfWords={10}
        feedbackTarget={{ type: 'word', wordId: { type: VocabularyItemTypes.Standard, id: 1 } }}
        exerciseKey={StandardExerciseKeys.vocabularyList}
      />,
    )
    expect(queryByTestId('customModal')).toBeFalsy()

    act((BackHandler as unknown as { mockPressBack: () => void }).mockPressBack)

    expect(getByTestId('customModal')).toBeTruthy()
    expect(getByTestId('customModal').props.visible).toBe(true)
    expect(getByText(getLabels().exercises.cancelModal.cancelAsk)).toBeTruthy()
    expect(getByText(getLabels().exercises.cancelModal.cancel)).toBeTruthy()
    expect(getByText(getLabels().general.back)).toBeTruthy()

    fireEvent.press(getByText(getLabels().exercises.cancelModal.cancel))

    expect(navigation.pop).toHaveBeenCalled()
  })

  it.each<[EmbeddedMode, boolean]>([
    [{ type: 'standalone' }, true],
    [{ type: 'active', session: { jobId: 1, unitId: 2, returnUrl: null, expiresAt: 1 } }, false],
  ])('should offer word feedback only when standalone (%j)', (embeddedMode, isOffered) => {
    const setOptions = jest.fn()
    render(
      <EmbeddedModeContext.Provider value={embeddedMode}>
        <ExerciseHeader
          navigation={{ ...navigation, setOptions }}
          currentWord={0}
          numberOfWords={3}
          feedbackTarget={{ type: 'word', wordId: { type: VocabularyItemTypes.Standard, id: 1 } }}
        />
      </EmbeddedModeContext.Provider>,
    )

    const { headerRight } = setOptions.mock.calls.at(-1)[0] as { headerRight: () => ReactElement }
    const { queryByLabelText } = render(headerRight())
    expect(queryByLabelText(getLabels().general.header.wordFeedback) !== null).toBe(isOffered)
  })
})
