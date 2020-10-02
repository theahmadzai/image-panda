import React, { useEffect, useCallback, useMemo, memo } from 'react'
import styled from '@emotion/styled'
import { imageActionType, imageStatus } from '../constants'
import { useImages } from '../contexts/ImagesContext'
import ImageListItem from './ImageListItem'

const List = styled.div`
  background: #fff;
  color: #000;
  height: 350px;
  margin-bottom: 16px;
  overflow: scroll;
  position: relative;
  width: 100%;

  div {
    align-items: center;
    display: grid;
    font-size: 14px;
    font-weight: 400;
    grid-template-columns: max-content 50% repeat(3, 15%);
    overflow: none;

    div {
      padding: 4px;
    }
  }

  & > :nth-of-type(even) {
    background: #efefef;
  }

  & > :first-of-type {
    background: #444;
    color: #eee;
    left: 0;
    position: sticky;
    top: 0;
  }
`

const ImageList = () => {
  const { images, dispatchImages } = useImages()

  useEffect(() => {
    Object.values(imageStatus).forEach(status => {
      window.electron.ipc.on(status, (e, { filePath, ...meta }) => {
        dispatchImages({
          type: imageActionType.CHANGE_STATUS,
          payload: { status, filePath, meta },
        })
      })
    })
  }, [dispatchImages])

  const handleCheckChangeAll = useCallback(
    e => {
      const { checked } = e.target

      dispatchImages({
        type: imageActionType.CHECK_CHANGE_ALL,
        payload: checked,
      })
    },
    [dispatchImages]
  )

  const handleCheckChange = useCallback(
    key => {
      dispatchImages({
        type: imageActionType.CHECK_CHANGE,
        payload: key,
      })
    },
    [dispatchImages]
  )

  const selectedCount = React.useMemo(
    () =>
      Array.from(images).reduce((t, [, { selected }]) => {
        return selected ? t + 1 : t
      }, 0),
    [images]
  )

  const imageListHeader = useMemo(
    () => (
      <div>
        <div>
          <input
            type="checkbox"
            checked={images.size === selectedCount && images.size !== 0}
            onChange={handleCheckChangeAll}
          />
        </div>
        <div>File Name</div>
        <div>Original Size</div>
        <div>Current Size</div>
        <div>Saved</div>
      </div>
    ),
    [selectedCount, handleCheckChangeAll, images.size]
  )

  return useMemo(() => {
    const imageListItems = Array.from(images, ([key, value]) => (
      <ImageListItem
        key={key}
        filePath={key}
        image={value}
        onCheckChange={handleCheckChange}
      />
    ))

    return (
      <List>
        {imageListHeader}
        {imageListItems}
      </List>
    )
  }, [images, handleCheckChange, imageListHeader])
}

export default memo(ImageList)
