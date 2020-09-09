import React, { useEffect } from 'react'
import { useApp } from '../AppContext'
import { useImages } from '../ImagesContext'
import { Stack, Button } from '../elements'
import FilePickerBar from './FilePickerBar'
import TinyfyBar from './TinyfyBar'
import ImageList from './ImageList'
import { pathsToImageObjects } from '../utils'
import {
  imageActionType,
  imageStatus,
  READY_TO_COMPRESS,
  COMPRESSION_START,
  COMPRESSION_COUNT
} from '../constants'
const { ipcRenderer, remote } = window.require('electron')
const { getImagesFromUser } = remote.require('./electron/dialogs.js')

const App = () => {
  const { app, setApp } = useApp()
  const { images, dispatchImages } = useImages()

  useEffect(() => {
    if (window.TINY_API_KEY && window.TINY_API_KEY.length) {
      setApp(state => ({
        ...state,
        apiKey: window.TINY_API_KEY,
        useTinify: true
      }))
    }

    ipcRenderer.on(COMPRESSION_COUNT, (e, compressionCount) => {
      setApp(state => ({ ...state, compressionCount }))
    })

    ipcRenderer.on('COMPRESSION_STATUS', (e, compressing) => {
      setApp(state => ({ ...state, compressing }))
    })
  }, [setApp])

  const handleAddMore = async () => {
    const filePaths = await getImagesFromUser()

    filePaths && dispatchImages({
      type: imageActionType.ADD,
      payload: pathsToImageObjects(filePaths)
    })
  }

  const handleRemoveSlected = () => {
    dispatchImages({
      type: imageActionType.REMOVE_SELECTED
    })
  }

  const handleCompress = () => {
    const filePaths = Array.from(images)
      .filter(([, { status }]) => status === READY_TO_COMPRESS || status === imageStatus.FAILED)
      .map(([key]) => key)

    ipcRenderer.send(COMPRESSION_START, app, filePaths)
  }

  const { compressing } = app

  return (
    <div className="App">
      <FilePickerBar />
      <TinyfyBar/>
      <ImageList />
      <Stack>
        <Button onClick={handleAddMore} disabled={compressing}>Add more</Button>
        <Button onClick={handleRemoveSlected} disabled={compressing}>Remove selected</Button>
        <Button onClick={handleCompress} disabled={compressing}>Compress images</Button>
      </Stack>
    </div>
  )
}

export default App
