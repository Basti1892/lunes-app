import { RouteProp, useIsFocused } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useState, ReactElement } from 'react'
import { FlatList, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import FeedbackBadge from '../../components/FeedbackBadge'
import Modal from '../../components/Modal'
import PressableOpacity from '../../components/PressableOpacity'
import RouteWrapper from '../../components/RouteWrapper'
import ServerResponseHandler from '../../components/ServerResponseHandler'
import Title from '../../components/Title'
import { Content, ContentTextBold } from '../../components/text/Content'
import { Heading } from '../../components/text/Heading'
import {
  Exercise,
  ExerciseFeedback,
  EXERCISES,
  StandardExerciseKeys,
  SCORE_THRESHOLD_POSITIVE_FEEDBACK,
} from '../../constants/data'
import useLoadUnit from '../../hooks/useLoadUnit'
import useLoadWordsByUnit from '../../hooks/useLoadWordsByUnit'
import useStorage from '../../hooks/useStorage'
import { StandardUnit } from '../../models/Unit'
import { RoutesParams } from '../../navigation/NavigationTypes'
import { getLabels, getNumberOfUnlockedExercises, wordsDescription } from '../../services/helpers'

const Container = styled.View`
  flex-direction: row;
  justify-content: center;
`

const BadgeWrapper = styled.View`
  height: ${props => props.theme.spacings.sm};
`

const ListItemResizer = styled.View`
  width: 100%;
  padding: 0 ${props => props.theme.spacings.lg};
`

const SmallMessage = styled(Content)`
  margin: 0 ${props => props.theme.spacings.md} ${props => props.theme.spacings.md};
  text-align: center;
`

const UnitItem = styled(PressableOpacity)`
  background-color: ${props => props.theme.colors.backgroundBlue};
  border-radius: ${props => props.theme.spacings.xs};
  padding: ${props => props.theme.spacings.md};
  gap: ${props => props.theme.spacings.sm};
`

type StandardExercisesProps = {
  unit: StandardUnit
  navigation: StackNavigationProp<RoutesParams, 'StandardExercises'>
}

const StandardExercises = ({ unit, navigation }: StandardExercisesProps): ReactElement => {
  const theme = useTheme()
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [scores] = useStorage('progress')
  const nextExerciseNumber = getNumberOfUnlockedExercises(scores, unit.id)
  const nextExercise = Object.values(EXERCISES).find(exercise => exercise.level === nextExerciseNumber) ?? null
  const [feedback, setFeedback] = useState<ExerciseFeedback[]>([])
  const [isFeedbackSet, setIsFeedbackSet] = useState<boolean>(false)
  const isFocused = useIsFocused()
  const { data: vocabularyItems, error, loading, refresh } = useLoadWordsByUnit(unit)

  useEffect(() => {
    if (!isFeedbackSet) {
      const exerciseScores = scores[unit.id.id] ?? {}
      const updatedFeedback: ExerciseFeedback[] = Object.values(exerciseScores).map(score => {
        if (!score) {
          return ExerciseFeedback.NONE
        }
        return score > SCORE_THRESHOLD_POSITIVE_FEEDBACK ? ExerciseFeedback.POSITIVE : ExerciseFeedback.NEGATIVE
      })
      updatedFeedback[0] = ExerciseFeedback.NONE
      setFeedback(updatedFeedback)
      setIsFeedbackSet(true)
    }
  }, [isFeedbackSet, unit, scores])

  useEffect(() => {
    if (isFocused) {
      setIsFeedbackSet(false)
    }
  }, [isFocused])

  const handleNavigation = (item: Exercise): void => {
    if (nextExercise && item.level > nextExercise.level) {
      setIsModalVisible(true)
      return
    }
    if (vocabularyItems) {
      navigation.navigate(item.screen, {
        contentType: 'standard',
        vocabularyItems,
        unitId: unit.id,
        unitTitle: unit.title,
      })
    }
  }

  const renderListItem = ({ item, index }: { item: Exercise; index: number }) => (
    <Container>
      <ListItemResizer>
        <BadgeWrapper>
          <FeedbackBadge feedback={feedback[index] ?? ExerciseFeedback.NONE} />
        </BadgeWrapper>
        <UnitItem onPress={() => handleNavigation(item)}>
          <item.icon />
          <View>
            <Heading>{item.title}</Heading>
            <Content>{item.description}</Content>
          </View>
        </UnitItem>
      </ListItemResizer>
    </Container>
  )

  const nextExercisePreposition =
    nextExercise?.key === StandardExerciseKeys.vocabularyList
      ? getLabels().exercises.lockedExerciseModal.confirmButtonLabelDeclinated
      : getLabels().exercises.lockedExerciseModal.confirmButtonLabel
  return (
    <RouteWrapper>
      {vocabularyItems && nextExercise && (
        <Modal
          onClose={() => setIsModalVisible(false)}
          visible={isModalVisible}
          text={getLabels().exercises.lockedExerciseModal.title}
          confirmationButtonText={`${nextExercisePreposition} ${nextExercise.title}`}
          confirmationAction={() => {
            handleNavigation(nextExercise)
            setIsModalVisible(false)
          }}
          testID='locking-modal'
        >
          <SmallMessage>
            {getLabels().exercises.lockedExerciseModal.descriptionPart1}
            <ContentTextBold>{` ${nextExercise.title} `}</ContentTextBold>
            {getLabels().exercises.lockedExerciseModal.descriptionPart2}
          </SmallMessage>
        </Modal>
      )}

      <ServerResponseHandler error={error} loading={loading} refresh={refresh}>
        {vocabularyItems && (
          <>
            <Title title={unit.title} description={wordsDescription(vocabularyItems.length)} />
            <FlatList
              data={Object.values(EXERCISES)}
              renderItem={renderListItem}
              keyExtractor={({ key }) => key}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: theme.spacingsPlain.xs,
                paddingBottom: theme.spacingsPlain.sm,
              }}
            />
          </>
        )}
      </ServerResponseHandler>
    </RouteWrapper>
  )
}

type StandardExercisesByIdProps = {
  jobId: number
  unitId: number
  navigation: StackNavigationProp<RoutesParams, 'StandardExercises'>
}

// Opened by URL on web (docs/web/0008-url-linking.md): the unit has to be loaded first
const StandardExercisesById = ({ jobId, unitId, navigation }: StandardExercisesByIdProps): ReactElement => {
  const { data: unit, error, loading, refresh } = useLoadUnit(jobId, unitId)

  if (unit !== null) {
    return <StandardExercises unit={unit} navigation={navigation} />
  }
  return (
    <RouteWrapper>
      <ServerResponseHandler error={error} loading={loading} refresh={refresh}>
        {null}
      </ServerResponseHandler>
    </RouteWrapper>
  )
}

type ExercisesScreenProps = {
  route: RouteProp<RoutesParams, 'StandardExercises'>
  navigation: StackNavigationProp<RoutesParams, 'StandardExercises'>
}

const StandardExercisesScreen = ({ route, navigation }: ExercisesScreenProps): ReactElement =>
  'unit' in route.params ? (
    <StandardExercises unit={route.params.unit} navigation={navigation} />
  ) : (
    <StandardExercisesById jobId={route.params.jobId} unitId={route.params.unitId} navigation={navigation} />
  )

export default StandardExercisesScreen
