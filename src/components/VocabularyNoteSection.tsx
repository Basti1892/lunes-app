import React, { ReactElement, useState } from 'react'
import styled, { useTheme } from 'styled-components/native'

import { PenIcon, TrashIcon } from '../../assets/images'
import { useStorageCache } from '../hooks/useStorage'
import useVocabularyNote from '../hooks/useVocabularyNote'
import { VocabularyItemId } from '../models/VocabularyItem'
import { useEmbeddedMode } from '../services/EmbeddedModeService'
import { getLabels } from '../services/helpers'
import { reportError } from '../services/sentry'
import { deleteVocabularyNote } from '../services/storageUtils'
import AddVocabularyNoteButton from './AddVocabularyNoteButton'
import CircularIconButton from './CircularIconButton'
import Modal from './Modal'
import VocabularyNoteCard from './VocabularyNoteCard'
import VocabularyNoteEditor from './VocabularyNoteEditor'
import { ContentSecondary, ContentText } from './text/Content'
import { uppercase } from './text/uppercase'

const Root = styled.View`
  padding-top: ${props => props.theme.spacings.sm};
`

const HeadingRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${props => props.theme.spacings.xs};
`

const Heading = styled(ContentSecondary)`
  ${uppercase};
`

const BorderedVocabularyNoteCard = styled(VocabularyNoteCard)`
  border: 1px solid ${props => props.theme.colors.backgroundHigh};
`

const ActionContainer = styled.View`
  flex-direction: row;
  gap: ${props => props.theme.spacings.xs};
`

const NoteIconButton = styled(CircularIconButton)`
  background-color: ${props => props.theme.colors.backgroundAccent};
`

const DeletionExplanation = styled(ContentSecondary)`
  padding: 0 ${props => props.theme.spacings.sm} ${props => props.theme.spacings.md};
  text-align: center;
`

type VocabularyNoteSectionProps = {
  wordId: VocabularyItemId
}

const VocabularyNoteSection = ({ wordId }: VocabularyNoteSectionProps): ReactElement | null => {
  const theme = useTheme()
  const storageCache = useStorageCache()
  const { note, isEditorOpen, openEditor, closeEditor } = useVocabularyNote(wordId)
  const [isDeletionConfirmationVisible, setIsDeletionConfirmationVisible] = useState<boolean>(false)
  // Not offered when launched from an LMS course: notes stay in the browser, which may be shared in school, and are
  // not part of the course (docs/web/0015-embedded-mode.md). The apps are always standalone.
  const embeddedMode = useEmbeddedMode()

  const {
    heading,
    edit,
    delete: deleteLabel,
    deletionTitle,
    deletionWarning,
    confirmDeletion,
    cancel,
  } = getLabels().notes

  const deleteNote = (): void => {
    deleteVocabularyNote(storageCache, wordId).catch(reportError)
    setIsDeletionConfirmationVisible(false)
  }

  const noteContent = (): ReactElement => {
    if (note === undefined) {
      return <AddVocabularyNoteButton onPress={openEditor} />
    }

    return (
      <>
        <HeadingRow>
          <Heading>{heading}</Heading>
          <ActionContainer>
            <NoteIconButton onPress={openEditor} accessibilityLabel={edit} hasBorder>
              <PenIcon testID='edit-note-icon' color={theme.colors.text} />
            </NoteIconButton>
            <NoteIconButton
              onPress={() => setIsDeletionConfirmationVisible(true)}
              accessibilityLabel={deleteLabel}
              hasBorder
            >
              <TrashIcon testID='delete-note-icon' color={theme.colors.incorrect} />
            </NoteIconButton>
          </ActionContainer>
        </HeadingRow>
        <BorderedVocabularyNoteCard onPress={openEditor}>
          <ContentText>{note.text}</ContentText>
        </BorderedVocabularyNoteCard>
      </>
    )
  }

  if (embeddedMode.type !== 'standalone') {
    return null
  }

  return (
    <>
      <Root>{noteContent()}</Root>
      {isEditorOpen && <VocabularyNoteEditor wordId={wordId} existingText={note?.text ?? null} onClose={closeEditor} />}
      <Modal
        visible={isDeletionConfirmationVisible}
        onClose={() => setIsDeletionConfirmationVisible(false)}
        text={deletionTitle}
        confirmationButtonText={confirmDeletion}
        cancelButtonText={cancel}
        confirmationAction={deleteNote}
      >
        <DeletionExplanation>{deletionWarning}</DeletionExplanation>
      </Modal>
    </>
  )
}

export default VocabularyNoteSection
