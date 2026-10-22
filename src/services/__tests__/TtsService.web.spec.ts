import EasySpeech from 'easy-speech'
import { mocked } from 'jest-mock'

import { findGermanVoice, initTts } from '../TtsService.web'

jest.mock('easy-speech', () => ({
  __esModule: true,
  default: {
    init: jest.fn(async () => true),
    status: jest.fn(() => ({ status: 'created' })),
    voices: jest.fn(() => []),
    defaults: jest.fn(),
  },
}))

const voice = (lang: string): SpeechSynthesisVoice => ({
  lang,
  name: lang,
  default: false,
  localService: true,
  voiceURI: lang,
})

describe('TtsService (web)', () => {
  beforeEach(jest.clearAllMocks)

  describe('findGermanVoice', () => {
    it('should prefer a voice for de-DE', () => {
      expect(findGermanVoice([voice('de-AT'), voice('en-US'), voice('de-DE')])?.lang).toBe('de-DE')
    })

    it('should accept language codes with an underscore', () => {
      expect(findGermanVoice([voice('en_US'), voice('de_DE')])?.lang).toBe('de_DE')
    })

    it('should fall back to another German voice', () => {
      expect(findGermanVoice([voice('en-US'), voice('de-CH')])?.lang).toBe('de-CH')
    })

    it('should return undefined without a German voice', () => {
      expect(findGermanVoice([voice('en-US'), voice('fr-FR')])).toBeUndefined()
    })
  })

  describe('initTts', () => {
    it('should use the German voice as default', async () => {
      const germanVoice = voice('de-DE')
      mocked(EasySpeech.voices).mockReturnValue([voice('en-US'), germanVoice])

      await expect(initTts()).resolves.toBe('initialized')

      expect(EasySpeech.init).toHaveBeenCalledTimes(1)
      expect(EasySpeech.defaults).toHaveBeenCalledWith({ voice: germanVoice })
    })

    it('should report an error without a German voice', async () => {
      mocked(EasySpeech.voices).mockReturnValue([voice('en-US')])

      await expect(initTts()).resolves.toBe('error')

      expect(EasySpeech.defaults).not.toHaveBeenCalled()
    })

    it('should reject if speech synthesis is not supported', async () => {
      mocked(EasySpeech.init).mockRejectedValueOnce(new Error('not supported'))

      await expect(initTts()).rejects.toThrow('not supported')
    })
  })
})
