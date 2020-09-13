import React, { useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import { imageActionType, imageStatus } from '../constants'
import { useImages } from '../contexts/ImagesContext'
import ImageListHeader from './ImageListHeader'
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
    grid-template-columns: auto auto auto auto auto;

    div {
      padding: 4px;
    }
  }

  & > :first-of-type {
    background: #f0f0f0;
    color: #000;
    height: 35px;
    left: 0;
    position: sticky;
    top: 0;
  }
`

const ImageList = () => {
  const { images, dispatchImages } = useImages()

  useEffect(() => {
    Object.values(imageStatus).forEach(status => {
      window.ipcRenderer.on(status, (e, { filePath, ...meta }) => {
        dispatchImages(({
          type: imageActionType.CHANGE_STATUS,
          payload: { status, filePath, meta }
        }))
      })
    })
  }, [dispatchImages])

  const handleCheckChange = useCallback(key => {
    dispatchImages({
      type: imageActionType.CHECK_CHANGE,
      payload: key
    })
  }, [dispatchImages])

  return (
    <List>
      <ImageListHeader/>
      {Array.from(images, ([filePath, image]) => (
        <ImageListItem
          key={filePath}
          filePath={filePath}
          onCheckChange={handleCheckChange}
          image={image} />
      ))}
    </List>
  )
}

export default ImageList
