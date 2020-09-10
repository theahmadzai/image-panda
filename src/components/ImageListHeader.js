import React from 'react'
import { imageActionType } from '../constants'
import { useImages } from '../contexts/ImagesContext'

const ImageListHeader = () => {
  const { images, dispatchImages } = useImages()

  const handleCheckChangeAll = e => {
    const { checked } = e.target

    dispatchImages({
      type: imageActionType.CHECK_CHANGE_ALL,
      payload: checked
    })
  }

  const selectedCount = Array.from(images).reduce((t, [, { selected }]) => {
    return selected ? t + 1 : t
  }, 0)

  return (
    <div>
      <div>
        <input
          type="checkbox"
          checked={images.size === selectedCount && images.size !== 0}
          onChange={handleCheckChangeAll} />
      </div>
      <div>File Name</div>
      <div>Original Size</div>
      <div>Current Size</div>
      <div>Saved</div>
    </div>
  )
}

export default ImageListHeader
