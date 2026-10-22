import { mocked } from 'jest-mock'

import { getUnitsOfJob } from '../../services/CmsApi'
import mockUnits from '../../testing/mockUnit'
import { loadUnit } from '../useLoadUnit'

jest.mock('../../services/CmsApi')

describe('loadUnit', () => {
  beforeEach(() => {
    mocked(getUnitsOfJob).mockResolvedValue(mockUnits)
  })

  it('should return the unit of the job', async () => {
    const unit = mockUnits[1]!

    await expect(loadUnit({ jobId: 7, unitId: unit.id.id, token: 'token' })).resolves.toEqual(unit)
    expect(getUnitsOfJob).toHaveBeenCalledWith({ id: { type: 'standard', id: 7 }, token: 'token' })
  })

  it('should fail if the job has no such unit', async () => {
    await expect(loadUnit({ jobId: 7, unitId: -1, token: undefined })).rejects.toThrow('Unit -1 not found in job 7')
  })
})
