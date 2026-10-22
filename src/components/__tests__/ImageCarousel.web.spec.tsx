import React from 'react'

import render from '../../testing/render'
import ImageCarousel from '../ImageCarousel.web'

describe('ImageCarousel (web)', () => {
  const images = ['https://example.com/Arbeitshose.png', 'https://example.com/Arbeitsschuhe.png']

  it('should display all images with a source uri', () => {
    const { getAllByTestId } = render(<ImageCarousel images={images} />)

    const displayedImages = getAllByTestId('image')
    expect(displayedImages).toHaveLength(2)
    expect(displayedImages[0]!.props.source).toEqual({ uri: images[0] })
    expect(displayedImages[1]!.props.source).toEqual({ uri: images[1] })
  })
})
