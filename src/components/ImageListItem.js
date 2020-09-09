import React, { Fragment } from 'react'
import filesize from 'filesize'
import { imageStatus } from '../constants'

const ImageListItem = ({ filePath, image, onCheckChange }) => {
  const { selected, status, meta } = image

  let row = null

  switch (status) {
    case imageStatus.COMPRESSING:
      row = (
        <Fragment>
          <div>{filesize(meta.originalSize)}</div>
          <div>COMPRESSING</div>
        </Fragment>
      )
      break

    case imageStatus.COMPRESSED:
      meta.savedSize = meta.originalSize - meta.currentSize
      meta.savedPercentage = Math.ceil(((meta.currentSize / meta.originalSize) * 100) - 100)
      row = (
        <Fragment>
          <div>{filesize(meta.originalSize)}</div>
          <div>{filesize(meta.currentSize)}</div>
          <div>{filesize(meta.savedSize)} ({meta.savedPercentage}%)</div>
        </Fragment>
      )
      break

    case imageStatus.FAILED:
      row = (
        <Fragment>
          <div>FAILED</div>
          <div>{meta.error}</div>
        </Fragment>
      )
      break

    default:
      row = (
        <div>READY</div>
      )
  }

  return (
    <div>
      <div>
        <input
          type="checkbox"
          checked={selected}
          onChange={onCheckChange.bind(null, filePath)} />
      </div>
      <div>{filePath.substring(filePath.lastIndexOf('\\') + 1)}</div>
      {row}
    </div>
  )
}

export default React.memo(ImageListItem)
