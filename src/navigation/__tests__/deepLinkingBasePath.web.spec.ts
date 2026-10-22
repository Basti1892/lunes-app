import { NavigationState, PartialState } from '@react-navigation/native'

import deepLinking, { withoutBasePath } from '../deepLinking.web'

jest.mock('../../constants/webBasePath', () => ({ WEB_BASE_PATH: '/lunes' }))

type State = PartialState<NavigationState>

describe('withoutBasePath', () => {
  it('should remove the base path', () => {
    expect(withoutBasePath('/lunes/jobs/1', '/lunes')).toBe('/jobs/1')
    expect(withoutBasePath('/lunes', '/lunes')).toBe('/')
    expect(withoutBasePath('/lunes?x=1', '/lunes')).toBe('/?x=1')
  })

  it('should keep paths outside of the base path', () => {
    expect(withoutBasePath('/lunesfoo/jobs/1', '/lunes')).toBe('/lunesfoo/jobs/1')
    expect(withoutBasePath('/jobs/1', '')).toBe('/jobs/1')
  })
})

describe('deepLinking (web) with a base path', () => {
  const stateOf = (path: string) => deepLinking.getStateFromPath!(path, deepLinking.config)
  const pathOf = (state: State): string => deepLinking.getPathFromState!(state, deepLinking.config)

  it('should open the units of a profession below the base path', () => {
    const homeTab = stateOf('/lunes/jobs/5')?.routes[0]?.state?.routes[0]?.state
    const unitSelection = homeTab?.routes[1]
    expect(unitSelection?.name).toBe('UnitSelection')
    expect(unitSelection?.params).toEqual({ jobId: 5 })
    // React Navigation reuses this path as URL
    expect(unitSelection?.path).toBe('/lunes/jobs/5')
  })

  it('should leave the start path to the app', () => {
    expect(stateOf('/lunes/')).toBeUndefined()
    expect(stateOf('/lunes')).toBeUndefined()
  })

  it('should add the base path to the URL', () => {
    const state: State = {
      routes: [
        {
          name: 'BottomTabNavigator',
          state: { routes: [{ name: 'HomeTab', state: { routes: [{ name: 'Home' }] } }] },
        },
      ],
    }
    expect(pathOf(state)).toBe('/lunes/')
  })
})
