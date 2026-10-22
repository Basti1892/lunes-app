import { getStateFromPath, PartialState, NavigationState } from '@react-navigation/native'

import { StandardJob } from '../../models/Job'
import { StandardUnit } from '../../models/Unit'
import mockUnits from '../../testing/mockUnit'
import deepLinking from '../deepLinking.web'

type State = PartialState<NavigationState>

const job: StandardJob = {
  id: { type: 'standard', id: 5 },
  name: 'Bäcker:in',
  icon: null,
  numberOfUnits: 1,
  migrated: false,
}
const unit: StandardUnit = { ...mockUnits[0]!, id: { type: 'standard', id: 7 } }

const homeStack = (...routes: State['routes']): State => ({
  routes: [
    {
      name: 'BottomTabNavigator',
      state: { routes: [{ name: 'HomeTab', state: { routes: [{ name: 'Home' }, ...routes] } }] },
    },
  ],
})

const pathOf = (state: State): string => deepLinking.getPathFromState!(state, deepLinking.config)
const stateOf = (path: string) => deepLinking.getStateFromPath!(path, deepLinking.config)

describe('deepLinking (web)', () => {
  describe('getStateFromPath', () => {
    it('should leave the start path to the app', () => {
      expect(stateOf('/')).toBeUndefined()
      expect(stateOf('/?utm_source=lms')).toBeUndefined()
    })

    it('should open the units of a profession with Home below it', () => {
      expect(stateOf('/jobs/5')).toEqual(getStateFromPath('/jobs/5', deepLinking.config))
      expect(JSON.stringify(stateOf('/jobs/5'))).toContain('"name":"Home"')
      expect(JSON.stringify(stateOf('/jobs/5'))).toContain('"name":"UnitSelection","params":{"jobId":5}')
    })

    it('should open the exercises of a unit with numeric ids and the units of the job below it', () => {
      const homeTab = stateOf('/jobs/5/units/7')?.routes[0]?.state?.routes[0]?.state
      expect(homeTab?.routes.map(({ name, params }) => ({ name, params }))).toEqual([
        { name: 'Home', params: undefined },
        { name: 'UnitSelection', params: { jobId: 5 } },
        { name: 'StandardExercises', params: { jobId: 5, unitId: 7 } },
      ])
      expect(homeTab?.index).toBe(2)
    })
  })

  describe('getPathFromState', () => {
    it('should use the job id for the units of a profession', () => {
      expect(pathOf(homeStack({ name: 'UnitSelection', params: { job } }))).toBe('/jobs/5')
    })

    it('should use the job and unit id for the exercises of a unit', () => {
      const state = homeStack(
        { name: 'UnitSelection', params: { job } },
        { name: 'StandardExercises', params: { unit, jobTitle: unit.title } },
      )
      expect(pathOf(state)).toBe('/jobs/5/units/7')
    })

    it('should keep the URL of the unit while an exercise is open', () => {
      const state: State = {
        routes: [
          ...homeStack(
            { name: 'UnitSelection', params: { job } },
            { name: 'StandardExercises', params: { unit, jobTitle: unit.title } },
          ).routes,
          { name: 'VocabularyList', params: { vocabularyItems: [], unitId: unit.id, unitTitle: unit.title } },
        ],
      }
      expect(pathOf(state)).toBe('/jobs/5/units/7')
    })

    it('should not put objects into the URL', () => {
      const state: State = {
        routes: [{ name: 'JobSelection', params: { initialSelection: false, jobScope: { type: 'lunesOnly' } } }],
      }
      expect(pathOf(state)).toBe('/select-job?initialSelection=false')
    })

    it('should fall back to the home screen for jobs of a content area', () => {
      const protectedJob = { ...job, id: { type: 'load-protected', apiKey: 'key' } }
      expect(pathOf(homeStack({ name: 'UnitSelection', params: { job: protectedJob } }))).toBe('/')
    })
  })
})
