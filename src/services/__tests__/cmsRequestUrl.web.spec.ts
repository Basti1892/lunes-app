import { toCmsRequestUrl } from '../cmsRequestUrl.web'

describe('toCmsRequestUrl (web)', () => {
  it('should turn a CMS url into a path on the own origin', () => {
    expect(toCmsRequestUrl('https://lunes-test.tuerantuer.org/api/v2/jobs')).toBe('/api/v2/jobs')
  })

  it('should keep query parameters', () => {
    expect(toCmsRequestUrl('https://lunes.tuerantuer.org/api/v2/words?search=abc')).toBe('/api/v2/words?search=abc')
  })
})
