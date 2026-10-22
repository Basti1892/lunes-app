import React, { ReactElement } from 'react'

import { ShareIcon } from '../../../../assets/images'
import Button from '../../../components/Button'
import { BUTTONS_THEME } from '../../../constants/data'
import { VocabularyItemResult } from '../../../navigation/NavigationTypes'
import { getLabels } from '../../../services/helpers'
import { shareText } from '../../../services/share'

type ShareButtonProps = {
  unitTitle: string
  results: VocabularyItemResult[]
}

const ShareButton = ({ unitTitle, results }: ShareButtonProps): ReactElement => {
  const share = async () => {
    const correctWords = results.filter(doc => doc.result === 'correct').length
    const xOfAllWords = `${correctWords} ${getLabels().results.of} ${results.length}`
    const message = `${getLabels().results.share.message1} '${unitTitle}' ${
      getLabels().results.share.message2
    } ${xOfAllWords} ${getLabels().results.share.message3}`

    await shareText(message)
  }

  return (
    <Button
      onPress={share}
      label={getLabels().results.share.button}
      buttonTheme={BUTTONS_THEME.outlined}
      iconRight={ShareIcon}
    />
  )
}

export default ShareButton
