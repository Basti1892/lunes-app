import { fireEvent } from '@testing-library/react-native'
import EasySpeech from 'easy-speech'
import React from 'react'

// Jest does not resolve .web.* files, so useTtsState reads the context of the native TtsService here
import { TtsServiceContext, TtsState } from '../../services/TtsService'
import render from '../../testing/render'
import AudioPlayer from '../AudioPlayer.web'

jest.mock('easy-speech', () => ({
  __esModule: true,
  default: {
    speak: jest.fn(async () => undefined),
    cancel: jest.fn(),
  },
}))

const mockPlay = jest.fn(async () => undefined)
const mockPause = jest.fn()
const mockAudio = jest.fn((src: string) => ({
  src,
  error: null,
  play: mockPlay,
  pause: mockPause,
  addEventListener: jest.fn(),
}))

describe('AudioPlayer (web)', () => {
  const audioUrl = 'https://example.com/audio.mp3'

  beforeAll(() => {
    Object.defineProperty(global, 'Audio', { value: mockAudio, writable: true })
  })

  beforeEach(jest.clearAllMocks)

  const renderAudioPlayer = ({
    audio = audioUrl,
    isTtsText = false,
    disabled = false,
    ttsState = 'initialized',
  }: {
    audio?: string
    isTtsText?: boolean
    disabled?: boolean
    ttsState?: TtsState
  }) =>
    render(
      <TtsServiceContext.Provider value={ttsState}>
        <AudioPlayer audio={audio} isTtsText={isTtsText} disabled={disabled} />
      </TtsServiceContext.Provider>,
    )

  it('should play an audio file', () => {
    const { getByTestId } = renderAudioPlayer({})

    fireEvent.press(getByTestId('audio-player'))

    expect(mockAudio).toHaveBeenCalledWith(audioUrl)
    expect(mockPlay).toHaveBeenCalledTimes(1)
    expect(EasySpeech.speak).not.toHaveBeenCalled()
  })

  it('should speak a tts text', () => {
    const ttsText = 'die Spachtel'
    const { getByTestId } = renderAudioPlayer({ audio: ttsText, isTtsText: true })

    fireEvent.press(getByTestId('audio-player'))

    expect(EasySpeech.speak).toHaveBeenCalledWith({ text: ttsText })
    expect(mockAudio).not.toHaveBeenCalled()
  })

  it('should be disabled', () => {
    const { getByTestId } = renderAudioPlayer({ disabled: true })

    expect(getByTestId('audio-player')).toBeDisabled()
    fireEvent.press(getByTestId('audio-player'))

    expect(mockAudio).not.toHaveBeenCalled()
  })

  it('should disable tts texts if no German voice is available', () => {
    const { getByTestId } = renderAudioPlayer({ audio: 'die Spachtel', isTtsText: true, ttsState: 'error' })

    expect(getByTestId('audio-player')).toBeDisabled()
  })

  it('should stop playback when removed', () => {
    const { getByTestId, unmount } = renderAudioPlayer({})
    fireEvent.press(getByTestId('audio-player'))

    unmount()

    expect(mockPause).toHaveBeenCalled()
  })
})
