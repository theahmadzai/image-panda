import React, { Fragment, memo } from 'react'
import filesize from 'filesize'
import { imageStatus } from '../constants'

const getRowColumns = ({ status, meta }) => {
  switch (status) {
    case imageStatus.COMPRESSED:
      return (
        <Fragment>
          <div style={{ textDecoration: 'line-through' }}>
            {filesize(meta.originalSize)}
          </div>
          <div>{filesize(meta.currentSize)}</div>
          <div style={{ color: 'green' }}>
            {filesize(meta.originalSize - meta.currentSize)}&nbsp; (
            {Math.ceil((meta.currentSize / meta.originalSize) * 100 - 100)}%)
          </div>
        </Fragment>
      )

    case imageStatus.COMPRESSING:
      return (
        <Fragment>
          <div>{filesize(meta.originalSize)}</div>
          <div>Compressing...</div>
          <div></div>
        </Fragment>
      )

    case imageStatus.FAILED:
      return (
        <Fragment>
          <div style={{ color: 'red' }}>{meta.error}</div>
        </Fragment>
      )

    default:
      return (
        <Fragment>
          <div></div>
          <div style={{ color: 'yellowgreen' }}>READY</div>
        </Fragment>
      )
  }
}

const ImageListItem = ({ filePath, image, onCheckChange }) => (
  <div>
    <div>
      <input
        type="checkbox"
        checked={image.selected}
        onChange={onCheckChange.bind(null, filePath)}
      />
    </div>
    <div
      style={{
        overflow: 'hidden',
        width: '320px',
        display: 'block',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {filePath.substring(filePath.lastIndexOf('\\') + 1)}
    </div>
    {getRowColumns(image)}
  </div>
)

export default memo(ImageListItem)
