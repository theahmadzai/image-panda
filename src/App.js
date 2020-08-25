import React, { useState, useEffect } from 'react'
import Logo from './Logo'
import useFilePicker from './useFilePicker'
import TinyBar from './TinyBar'
import styled from '@emotion/styled'
import { Stack, Button } from './elements'
const path = window.require('path')
const { ipcRenderer, remote: { dialog } } = window.require('electron')

const Pickers = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto auto;
  padding: 16px;
`

const ImagesList = styled.div`
  background: #fff;
  color: #000;
  height: 270px;
  margin: 0 16px 16px 16px;
  overflow: scroll;
  position: relative;
  width: calc(100% - 32px);

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

const filters = [
  { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
  { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
  { name: 'Custom File Type', extensions: ['as'] },
  { name: 'All Files', extensions: ['*'] }
]

const properties = [
  'multiSelections'
]

const outputPathOptions = {
  title: 'Output path',
  properties: [
    'openDirectory'
  ]
}

const App = () => {
  const [InputFilePicker,, setInputPath] = useFilePicker('Input Files')
  const [OutputFilePicker, outputPath, setOutputPath] = useFilePicker(
    'Output Directory',
    'Select folder...'
  )
  const [images, setImages] = useState(new Set())
  const [selected, setSelected] = useState(new Set())

  useEffect(() => {
    setInputPath(images.size === 1
      ? images.values().next().value
      : `${images.size} images selected`
    )
  }, [images, setInputPath])

  const handleInput = () => {
    dialog.showOpenDialog(null, { filters, properties })
      .then(({ canceled, filePaths }) => {
        if (canceled || filePaths.length < 1) return

        setImages(new Set(filePaths))
      })
      .catch(() => {
        dialog.showErrorBox('Error opening files', 'Failed to open image file.')
      })
  }

  const handleAddMore = () => {
    dialog.showOpenDialog(null, { filters, properties })
      .then(({ canceled, filePaths }) => {
        if (canceled || filePaths.length < 1) return

        setImages(new Set([...filePaths, ...images]))
      })
      .catch(() => {
        dialog.showErrorBox('Error opening files', 'Failed to open image file.')
      })
  }

  const handleOutput = () => {
    dialog.showOpenDialog(outputPathOptions)
      .then(({ canceled, filePaths }) => {
        if (canceled || filePaths.length < 1) return

        setOutputPath(filePaths[0])
      })
  }

  const handleSelectAll = () => {
    if (selected.size === images.size) setSelected(new Set())
    else setSelected(new Set(images))
  }

  const handleCheckChange = (i) => {
    if (selected.has(i)) selected.delete(i)
    else selected.add(i)

    setSelected(new Set(selected))
  }

  const handleRemoveSlected = () => {
    selected.forEach(image => {
      images.delete(image)
      selected.delete(image)
    })

    setImages(new Set(images))
    setSelected(new Set(selected))
  }

  const handleCompress = () => {
    ipcRenderer.send('images:compress', outputPath, Array.from(images))
  }

  return (
    <div className="App">
      <Logo />
      <Pickers>
        <InputFilePicker onClick={handleInput} />
        <OutputFilePicker onClick={handleOutput} />
      </Pickers>
      <TinyBar />
      <ImagesList>
        <div>
          <div>
            <input
              type="checkbox"
              checked={images.size === selected.size && images.size !== 0}
              onChange={handleSelectAll} />
          </div>
          <div>Filename</div>
          <div>Original Size</div>
          <div>Current Size</div>
          <div>Compressed</div>
        </div>
        {Array.from(images).map((image, i) => (
          <div key={i}>
            <div>
              <input
                type="checkbox"
                checked={selected.has(image)}
                onChange={handleCheckChange.bind(this, image)} />
            </div>
            <div>{path.basename(image)}</div>
            <div>56.2KB</div>
            <div>20.0KB</div>
            <div>-30%</div>
          </div>
        ))}
      </ImagesList>
      <Stack>
        <Button onClick={handleRemoveSlected}>Remove selected</Button>
        <Button onClick={handleAddMore}>Add more</Button>
        <Button onClick={handleCompress}>Compress images</Button>
      </Stack>
    </div>
  )
}

export default App
