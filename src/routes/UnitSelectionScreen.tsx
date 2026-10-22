import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { ReactElement } from 'react'
import { FlatList } from 'react-native'
import styled from 'styled-components/native'

import { UnitListItem } from '../components/DisciplineListItem'
import ProgressHint from '../components/ProgressHint'
import RouteWrapper from '../components/RouteWrapper'
import ServerResponseHandler from '../components/ServerResponseHandler'
import Title from '../components/Title'
import useLoadJob from '../hooks/useLoadJob'
import useLoadUnits from '../hooks/useLoadUnits'
import useStorage from '../hooks/useStorage'
import Job, { StandardJobId } from '../models/Job'
import { StandardUnit } from '../models/Unit'
import { RoutesParams } from '../navigation/NavigationTypes'
import { childrenDescription } from '../services/helpers'

const List = styled.FlatList`
  margin: 0 ${props => props.theme.spacings.md};
  height: 100%;
` as unknown as typeof FlatList

type UnitSelectionProps = {
  job: Job
  navigation: StackNavigationProp<RoutesParams, 'UnitSelection'>
}

const UnitSelection = ({ job, navigation }: UnitSelectionProps): ReactElement => {
  const { data: units, error, loading, refresh } = useLoadUnits(job)

  const handleNavigation = (selectedItem: StandardUnit): void => {
    navigation.navigate('StandardExercises', {
      unit: selectedItem,
      jobTitle: selectedItem.title,
    })
  }

  const renderListItem = ({ item }: { item: StandardUnit }): ReactElement => (
    <UnitListItem unit={item} onPress={() => handleNavigation(item)} />
  )

  const [notMigratedSelectedJobs] = useStorage('notMigratedSelectedJobs')
  const progressMayHaveBeenLost =
    job.id.type === 'standard' && notMigratedSelectedJobs.includes(job.id.id) && job.migrated

  return (
    <RouteWrapper>
      <ServerResponseHandler error={error} loading={loading} refresh={refresh}>
        <List
          ListHeaderComponent={
            <>
              <Title title={job.name} description={childrenDescription(job)} />
              {progressMayHaveBeenLost && <ProgressHint jobId={job.id as StandardJobId} />}
            </>
          }
          data={units}
          renderItem={renderListItem}
          keyExtractor={({ id }) => JSON.stringify(id)}
          showsVerticalScrollIndicator={false}
        />
      </ServerResponseHandler>
    </RouteWrapper>
  )
}

type UnitSelectionByJobIdProps = {
  jobId: number
  navigation: StackNavigationProp<RoutesParams, 'UnitSelection'>
}

// Opened by URL on web (docs/web/0008-url-linking.md): the job has to be loaded first
const UnitSelectionByJobId = ({ jobId, navigation }: UnitSelectionByJobIdProps): ReactElement => {
  const { data: job, error, loading, refresh } = useLoadJob({ type: 'standard', id: jobId })

  if (job !== null) {
    return <UnitSelection job={job} navigation={navigation} />
  }
  return (
    <RouteWrapper>
      <ServerResponseHandler error={error} loading={loading} refresh={refresh}>
        {null}
      </ServerResponseHandler>
    </RouteWrapper>
  )
}

type UnitSelectionScreenProps = {
  route: RouteProp<RoutesParams, 'UnitSelection'>
  navigation: StackNavigationProp<RoutesParams, 'UnitSelection'>
}

const UnitSelectionScreen = ({ route, navigation }: UnitSelectionScreenProps): ReactElement =>
  'job' in route.params ? (
    <UnitSelection job={route.params.job} navigation={navigation} />
  ) : (
    <UnitSelectionByJobId jobId={route.params.jobId} navigation={navigation} />
  )

export default UnitSelectionScreen
