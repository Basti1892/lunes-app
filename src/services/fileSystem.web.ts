import type * as NativeFileSystem from '@dr.pogodin/react-native-fs'

// There is no file system on web, so user vocabulary with images and recordings is not available (docs/web/0009)

export const DocumentDirectoryPath = ''

export const moveFile: typeof NativeFileSystem.moveFile = async () => {
  throw new Error('moveFile is not supported on web')
}

// No files are ever written on web, so there is nothing to delete
export const unlink: typeof NativeFileSystem.unlink = async () => undefined
