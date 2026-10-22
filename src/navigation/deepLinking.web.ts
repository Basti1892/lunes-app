import { getPathFromState, getStateFromPath, LinkingOptions } from '@react-navigation/native'

import Job from '../models/Job'
import { StandardUnit } from '../models/Unit'
import { RoutesParams } from './NavigationTypes'

// URLs of the web version (docs/web/0008-url-linking.md):
// /select-job, /jobs/:jobId (units of a profession), /jobs/:jobId/units/:unitId (exercises of a unit), /manage-jobs.
// Exercises and results only live in memory, so while they are open the URL stays the one of the unit.

type State = Parameters<typeof getPathFromState>[0]
type Route = State['routes'][number]

const LINKABLE_ROOT_ROUTES: readonly string[] = ['BottomTabNavigator', 'JobSelection']

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

// Objects and arrays cannot be part of a URL
const withoutObjects = (params: object | undefined): object | undefined =>
  params && Object.fromEntries(Object.entries(params).filter(([, value]) => !isObject(value)))

const jobIdOf = (route: Route): number | undefined =>
  isObject(route.params) && typeof route.params.jobId === 'number' ? route.params.jobId : undefined

// Replaces the objects the apps pass to UnitSelection and StandardExercises with their ids
const toLinkableRoute = (route: Route, jobId: number | undefined): Route | null => {
  const { params } = route
  if (route.name === 'UnitSelection' && isObject(params) && 'job' in params) {
    const { id } = params.job as Job
    return id.type === 'standard' ? { ...route, params: { jobId: id.id } } : null
  }
  if (route.name === 'StandardExercises' && isObject(params) && 'unit' in params) {
    const { unit } = params as { unit: StandardUnit }
    return jobId === undefined ? null : { ...route, params: { jobId, unitId: unit.id.id } }
  }
  return { ...route, params: withoutObjects(params) }
}

// Keeps the routes up to the focused one that can be restored from a URL
type LinkableRoutes = {
  routes: Route[]
  jobId: number | undefined
  done: boolean
}

export const toLinkableState = (state: State, isRoot = true): State => {
  const focusedIndex = state.index ?? state.routes.length - 1

  const { routes } = state.routes.slice(0, focusedIndex + 1).reduce<LinkableRoutes>(
    (result, route) => {
      if (result.done || (isRoot && !LINKABLE_ROOT_ROUTES.includes(route.name))) {
        return { ...result, done: true }
      }
      const linkableRoute = toLinkableRoute(route, result.jobId)
      if (linkableRoute === null) {
        return { ...result, done: true }
      }
      const withLinkableState = linkableRoute.state
        ? ({ ...linkableRoute, state: toLinkableState(linkableRoute.state, false) } as Route)
        : linkableRoute
      return {
        routes: [...result.routes, withLinkableState],
        jobId: jobIdOf(linkableRoute) ?? result.jobId,
        done: false,
      }
    },
    { routes: [], jobId: undefined, done: false },
  )

  return { ...state, routes, index: routes.length - 1 } as State
}

const isStartPath = (path: string): boolean => path.replace(/^\//, '').split('?')[0] === ''

type PathState = NonNullable<ReturnType<typeof getStateFromPath>>

// The state of a unit URL only has Home below the unit. The units of its job are added in between,
// so that going back leads to them like in the app.
const withUnitSelectionBelowUnit = (state: PathState): PathState => {
  const routes = state.routes.flatMap((route, index) => {
    const withNestedState = route.state ? { ...route, state: withUnitSelectionBelowUnit(route.state) } : route
    const isUnitWithoutJob = route.name === 'StandardExercises' && state.routes[index - 1]?.name !== 'UnitSelection'
    return isUnitWithoutJob && isObject(route.params)
      ? [{ name: 'UnitSelection', params: { jobId: route.params.jobId } }, withNestedState]
      : [withNestedState]
  })
  return { ...state, routes, ...(state.index === undefined ? {} : { index: routes.length - 1 }) }
}

const deepLinking: LinkingOptions<RoutesParams> = {
  prefixes: [],
  config: {
    screens: {
      JobSelection: {
        path: 'select-job',
        parse: { initialSelection: (value: string) => value === 'true' },
      },
      BottomTabNavigator: {
        screens: {
          HomeTab: {
            // So that a URL like /jobs/1 has Home below it in the stack (back button).
            // @ts-expect-error HomeTabParams in NavigationTypes.ts do not list the screens of the home stack
            initialRouteName: 'Home',
            screens: {
              Home: '',
              UnitSelection: { path: 'jobs/:jobId', parse: { jobId: Number } },
              StandardExercises: { path: 'jobs/:jobId/units/:unitId', parse: { jobId: Number, unitId: Number } },
              ManageSelection: 'manage-jobs',
            },
          },
        },
      },
    },
  },
  // Without a path the app decides itself whether to start with the job selection (first start) or the home screen
  getStateFromPath: (path, options) => {
    if (isStartPath(path)) {
      return undefined
    }
    const state = getStateFromPath(path, options)
    return state && withUnitSelectionBelowUnit(state)
  },
  getPathFromState: (state, options) => {
    const linkableState = toLinkableState(state)
    return linkableState.routes.length > 0 ? getPathFromState(linkableState, options) : '/'
  },
}

export default deepLinking
