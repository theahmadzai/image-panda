import React, { useContext, useEffect } from 'react'
import styled from '@emotion/styled'
import { baseGrid } from '../styles'
import { AppContext } from '../contexts/AppContext'
import { ImagesContext } from '../contexts/ImagesContext'
import { imageActionType } from '../constants'
import FilePicker from './FilePicker'
import { filePathsToImages } from '../utils'
const { remote } = window.require('electron')
const { getImagesFromUser, getDirectoryFromUser } = remote.require('./electron/dialogs.js')

const Grid = styled.div`
  ${baseGrid}

  grid-template-columns: auto auto;
`

const FilePickerBar = () => {
  const { app, setApp } = useContext(AppContext)
  const { images, dispatchImages } = useContext(ImagesContext)

  const { inputPath, outputPath, compressing } = app

  useEffect(() => {
    setApp(state => {
      const inputPath = images.size === 0 ? ''
        : images.size === 1 ? images.keys().next().value
          : `${images.size} images selected`

      return { ...state, inputPath }
    })
  }, [images, setApp])

  const handleInputPicker = async () => {
    const filePaths = await getImagesFromUser()

    filePaths && dispatchImages({
      type: imageActionType.SET,
      payload: filePathsToImages(filePaths)
    })
  }

  const handleOutputPicker = async () => {
    const directory = await getDirectoryFromUser()

    directory && setApp(state => ({
      outputPath: directory
    }))
  }

  return (
    <Grid>
      <FilePicker
        label='Input Files'
        placeholder='No images selected'
        disabled={compressing}
        value={inputPath}
        onClick={handleInputPicker} />
      <FilePicker
        label='Output Directory'
        placeholder='Select folder...'
        disabled={compressing}
        value={outputPath}
        onClick={handleOutputPicker} />
    </Grid>
  )
}

export default FilePickerBar
