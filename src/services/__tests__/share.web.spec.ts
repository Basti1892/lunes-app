import { canShare, shareText } from '../share.web'

describe('share (web)', () => {
  const setShare = (share: ((data: ShareData) => Promise<void>) | undefined): void => {
    Object.defineProperty(navigator, 'share', { value: share, configurable: true, writable: true })
  }

  afterEach(() => setShare(undefined))

  it('should not be able to share without the Web Share API', () => {
    setShare(undefined)

    expect(canShare()).toBe(false)
  })

  it('should share the message as text', async () => {
    const share = jest.fn(async () => undefined)
    setShare(share)

    expect(canShare()).toBe(true)
    await shareText('Lunes')

    expect(share).toHaveBeenCalledWith({ text: 'Lunes' })
  })

  it('should ignore if the user closes the share dialog', async () => {
    setShare(jest.fn().mockRejectedValue(new DOMException('canceled', 'AbortError')))

    await expect(shareText('Lunes')).resolves.toBeUndefined()
  })

  it('should pass on other errors', async () => {
    setShare(jest.fn().mockRejectedValue(new DOMException('not allowed', 'NotAllowedError')))

    await expect(shareText('Lunes')).rejects.toThrow('not allowed')
  })
})
