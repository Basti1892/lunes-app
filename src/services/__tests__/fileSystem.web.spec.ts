import { moveFile, unlink } from '../fileSystem.web'

describe('fileSystem (web)', () => {
  it('should reject moving files', async () => {
    await expect(moveFile('image.jpg', 'target.jpg')).rejects.toThrow('moveFile is not supported on web')
  })

  it('should resolve deleting files', async () => {
    await expect(unlink('image.jpg')).resolves.toBeUndefined()
  })
})
