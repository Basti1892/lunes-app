import { StackNavigationProp } from '@react-navigation/stack'
import React, { ReactElement } from 'react'
import styled from 'styled-components/native'

import { LunesIcon, MenuIcon } from '../../../../assets/images'
import { FEATURES } from '../../../constants/features'
import { RoutesParams } from '../../../navigation/NavigationTypes'
import { getLabels } from '../../../services/helpers'

const Wrapper = styled.View`
  background-color: ${props => props.theme.colors.primary};
`

const SmileIconStyle = styled.Pressable`
  position: absolute;
  align-self: center;
  bottom: -${props => props.theme.spacings.xxl};
`

const MenuIconContainer = styled.TouchableOpacity`
  align-self: flex-end;
  padding: ${props => props.theme.spacings.sm} ${props => props.theme.spacings.xxs};
`

const MenuIconWhite = styled(MenuIcon)`
  padding: 0 ${props => props.theme.spacings.md};
  color: ${props => props.theme.colors.backgroundAccent};
`

// Height of assets/images/menu.svg
const MENU_ICON_HEIGHT = 29

// Keeps the header height if the menu is not available (web)
const MenuIconPlaceholder = styled.View`
  height: ${MENU_ICON_HEIGHT}px;
  margin: ${props => props.theme.spacings.sm} 0;
`

type HomeScreenHeaderProps = {
  navigation: StackNavigationProp<RoutesParams, keyof RoutesParams>
}

const HomeScreenHeader = ({ navigation }: HomeScreenHeaderProps): ReactElement => (
  <Wrapper testID='header'>
    <SmileIconStyle>
      <LunesIcon width={96} height={96} />
    </SmileIconStyle>
    {FEATURES.menu ? (
      <MenuIconContainer onPress={() => navigation.navigate('OverlayMenu')}>
        <MenuIconWhite testID='menu-icon-white' accessibilityLabel={getLabels().general.header.menu} />
      </MenuIconContainer>
    ) : (
      <MenuIconPlaceholder />
    )}
  </Wrapper>
)

export default HomeScreenHeader
