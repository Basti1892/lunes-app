import { Share } from 'react-native'

// Single entry point for sharing text, replaced by share.web.ts on web (docs/web/0002)

export const canShare = (): boolean => true

export const shareText = async (message: string): Promise<void> => {
  await Share.share({ message })
}
