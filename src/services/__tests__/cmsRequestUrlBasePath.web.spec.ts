import { toCmsRequestUrl } from '../cmsRequestUrl.web'

jest.mock('../../constants/webBasePath', () => ({ WEB_BASE_PATH: '/lunes' }))

describe('toCmsRequestUrl (web) with a base path', () => {
  it('should send requests to the API below the base path', () => {
    expect(toCmsRequestUrl('https://lunes-test.tuerantuer.org/api/v2/jobs?x=1')).toBe('/lunes/api/v2/jobs?x=1')
  })
})
