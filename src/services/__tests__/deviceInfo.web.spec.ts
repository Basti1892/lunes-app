import { versionName } from '../../../version.json'
import { getVersion, isEmulatorSync, isTablet } from '../deviceInfo.web'

describe('deviceInfo (web)', () => {
  it('should return the version name of the app', () => {
    expect(getVersion()).toBe(versionName)
  })

  it('should never report an emulator or a tablet', () => {
    expect(isEmulatorSync()).toBe(false)
    expect(isTablet()).toBe(false)
  })
})
