import { StandardUnit } from '../models/Unit'
import { getUnitsOfJob } from '../services/CmsApi'
import { tokenForJob } from '../services/storageUtils'
import { Return, useLoadAsync } from './useLoadAsync'
import useStorage from './useStorage'

type LoadUnitParams = {
  jobId: number
  unitId: number
  token: string | undefined
}

// The CMS has no endpoint for a single unit, so the unit is taken from the units of its job
export const loadUnit = async ({ jobId, unitId, token }: LoadUnitParams): Promise<StandardUnit> => {
  const units = await getUnitsOfJob({ id: { type: 'standard', id: jobId }, token })
  const unit = units.find(({ id }) => id.id === unitId)
  if (unit === undefined) {
    throw new Error(`Unit ${unitId} not found in job ${jobId}`)
  }
  return unit
}

const useLoadUnit = (jobId: number, unitId: number): Return<StandardUnit> => {
  const [selectedJobs] = useStorage('selectedJobs')
  const token = tokenForJob(selectedJobs, { type: 'standard', id: jobId })
  return useLoadAsync(loadUnit, { jobId, unitId, token })
}

export default useLoadUnit
