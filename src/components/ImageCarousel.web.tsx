import React, { ComponentProps, ReactElement } from 'react'
import { useWindowDimensions } from 'react-native'
import styled from 'styled-components/native'

import type NativeImageCarousel from './ImageCarousel'

// Placeholder until the carousel is implemented for web in step 6: shows the first image only.
// The native ImageCarousel cannot be bundled, because react-native-pager-view is native only.

const VIEWER_HEIGHT_PERCENT = 0.35

const ImageViewContainer = styled.View<{ height: number }>`
  height: ${({ height }) => height}px;
  background-color: ${props => props.theme.colors.backgroundAccent};
`

const StyledImage = styled.Image`
  height: 100%;
`

const ImageCarousel = ({ images }: ComponentProps<typeof NativeImageCarousel>): ReactElement => {
  const { height: deviceHeight } = useWindowDimensions()
  const [firstImage] = images

  return (
    <ImageViewContainer height={deviceHeight * VIEWER_HEIGHT_PERCENT}>
      {firstImage !== undefined && <StyledImage src={firstImage} testID='image' resizeMode='contain' />}
    </ImageViewContainer>
  )
}

export default ImageCarousel
