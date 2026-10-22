import React, { ComponentProps, ReactElement, useState } from 'react'
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions } from 'react-native'
import styled from 'styled-components/native'

import type NativeImageCarousel from './ImageCarousel'

// react-native-pager-view is native only. On web the images are pages of a horizontal ScrollView, which can be
// swiped on touch devices and scrolled with a touchpad. The indicator is the same as on native.

const VIEWER_HEIGHT_PERCENT = 0.35
// One scroll event per frame, so the indicator follows the scroll position
const SCROLL_EVENT_THROTTLE_MS = 16

const ImageViewContainer = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
  background-color: ${props => props.theme.colors.backgroundAccent};
`

const ScrollView = styled.ScrollView`
  flex: 1;
`

const Page = styled.View<{ width: number }>`
  width: ${({ width }) => width}px;
  height: 100%;
`

const StyledImage = styled.Image`
  width: 100%;
  height: 100%;
`

const Dot = styled.View`
  height: 5px;
  width: 5px;
  background-color: ${props => props.theme.colors.placeholder};
  border-radius: 20px;
  margin: 2px;
`

const ActiveDot = styled(Dot)`
  height: 10px;
  width: 10px;
  background-color: ${props => props.theme.colors.textSecondary};
`

const IndicatorView = styled.View`
  width: 100%;
  position: absolute;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  top: ${props => props.theme.spacings.xs};
`

const ImageCarousel = ({ images }: ComponentProps<typeof NativeImageCarousel>): ReactElement => {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageWidth, setPageWidth] = useState(0)
  const { height: deviceHeight } = useWindowDimensions()

  const onLayout = (event: LayoutChangeEvent): void => setPageWidth(event.nativeEvent.layout.width)

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    if (pageWidth > 0) {
      setCurrentPage(Math.round(event.nativeEvent.contentOffset.x / pageWidth))
    }
  }

  return (
    <ImageViewContainer height={deviceHeight * VIEWER_HEIGHT_PERCENT} onLayout={onLayout}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
      >
        {images.map(url => (
          <Page key={url} width={pageWidth}>
            {/* react-native-web does not support the src prop of Image, only source */}
            <StyledImage source={{ uri: url }} testID='image' resizeMode='contain' />
          </Page>
        ))}
      </ScrollView>
      <IndicatorView>
        {images.length > 1 &&
          images.map((url, index) => (index === currentPage ? <ActiveDot key={url} /> : <Dot key={url} />))}
      </IndicatorView>
    </ImageViewContainer>
  )
}

export default ImageCarousel
