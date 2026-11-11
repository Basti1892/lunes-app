import React, { ReactElement } from 'react'
import { useTheme } from 'styled-components/native'

import { ArrowLeftCircleOutlineIcon } from '../../assets/images'
import { NavigationTitle } from '../components/NavigationTitle'
import { getLabels } from '../services/helpers'

// Web only (HomeStackNavigator.web.tsx): renders an HTML link. In the embedded mode it replaces the header back
// button and leads to the return URL of the LMS (FR-13, docs/web/0015-embedded-mode.md). The LMS page opens in the
// top-level window: inside the iframe, Moodle would show its course page within the course page.

export const isWebUrl = (url: string): boolean => {
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

type BackToCourseLinkProps = {
  url: string
}

const BackToCourseLink = ({ url }: BackToCourseLinkProps): ReactElement => {
  const theme = useTheme()
  return (
    <a
      href={url}
      target='_top'
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: theme.spacingsPlain.sm,
        textDecoration: 'none',
      }}
    >
      <ArrowLeftCircleOutlineIcon width={theme.sizes.defaultIcon} height={theme.sizes.defaultIcon} />
      <NavigationTitle numberOfLines={2}>{getLabels().general.header.backToCourse}</NavigationTitle>
    </a>
  )
}

export default BackToCourseLink
