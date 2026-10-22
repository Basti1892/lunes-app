import type * as NativeShare from './share'

// Uses the Web Share API. It is missing in some desktop browsers and in iframes without allow="web-share";
// the share section is hidden there.

export const canShare: typeof NativeShare.canShare = () => typeof navigator.share === 'function'

export const shareText: typeof NativeShare.shareText = async message => {
  try {
    await navigator.share({ text: message })
  } catch (error) {
    // The user closed the share dialog
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }
    throw error
  }
}
