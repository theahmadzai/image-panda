import React, { useState, useEffect, useCallback, Fragment } from 'react'
import filesize from 'filesize'
import { imageStore, imageSelect, imageStatus } from './constants'
import FilePicker from './FilePicker'
import TinyBar from './TinyBar'
import styled from '@emotion/styled'
import { Stack, Button } from './elements'
const path = window.require('path')
const { ipcRenderer, remote } = window.require('electron')
const { getFilesFromUser, getDirectoryFromUser } = remote.require('./main.js')

const Pickers = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: auto auto;
  margin-bottom: 16px;
`

const ImagesList = styled.div`
  background: #fff;
  color: #000;
  height: 330px;
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

const selectedCount = images => Array.from(images).reduce((t, image) => {
  if (image[1].selected) return t + 1
  return t
}, 0)

const pathsToImageObjects = paths => new Map(paths.map(path => ([path, {
  status: imageStatus.READY,
  selected: false,
  meta: {
    originalSize: 0,
    currentSize: 0,
    compressionRate: 0
  }
}])))

const imagesStoreReducer = (state, { type, payload }) => {
  switch (type) {
    case imageStore.ADD:
      return new Map([...state, ...payload])

    case imageStore.UPDATE:
      return new Map(payload)

    case imageStore.REMOVE_SELECTED:
      Map.prototype.forEach.call(payload, ({ selected }, image) => {
        if (selected) payload.delete(image)
      })
      return new Map(payload)

    default:
      return state
  }
}

const imagesSelectReducer = (state, { type, payload }) => {
  switch (type) {
    case imageSelect.CHECK_CHANGE:
      return new Map([...state, [payload, {
        status: state.get(payload).status,
        selected: !state.get(payload).selected,
        meta: state.get(payload).meta
      }]])

    case imageSelect.CHECK_ALL:
      Map.prototype.forEach.call(payload, image => {
        image.selected = true
      })
      return new Map(payload)

    case imageSelect.UNCHECK_ALL:
      Map.prototype.forEach.call(payload, image => {
        image.selected = false
      })
      return new Map(payload)

    default:
      return state
  }
}

const imagesStatusReducer = (state, { type, payload: { key, meta } }) => {
  switch (type) {
    case imageStatus.COMPRESSING:
    case imageStatus.COMPRESSED:
    case imageStatus.FAILED:
      return new Map([...state, [key, {
        status: type,
        selected: state.get(key).selected,
        meta
      }]])

    default:
      return state
  }
}

const App = () => {
  const [images, setImages] = useState(new Map())
  const [inputPath, setInputPath] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [byTiny, setByTiny] = useState(false)

  useEffect(() => {
    images.size !== 0 && setInputPath(state => {
      if (images.size === 1) return images.keys().next().value
      else return `${images.size} images selected`
    })
  }, [images, setInputPath])

  useEffect(() => {
    ipcRenderer.on('image:compressing', (e, { filePath, meta }) => {
      setImages(state => imagesStatusReducer(state, {
        type: imageStatus.COMPRESSING,
        payload: { key: filePath, meta }
      }))
    })

    ipcRenderer.on('image:compressed', (e, { filePath, meta }) => {
      setImages(state => imagesStatusReducer(state, {
        type: imageStatus.COMPRESSED,
        payload: { key: filePath, meta }
      }))
    })
  }, [])

  const handleInputPath = useCallback(async () => {
    const filePaths = await getFilesFromUser()

    filePaths && setImages(state => imagesStoreReducer(state, {
      type: imageStore.UPDATE,
      payload: pathsToImageObjects(filePaths)
    }))
  }, [])

  const handleOutputPath = useCallback(async () => {
    const directory = await getDirectoryFromUser()

    directory && setOutputPath(directory)
  }, [])

  const handleApiKey = useCallback((e) => {
    setApiKey(e.target.value)
  }, [])

  const handleByTiny = useCallback(() => {
    setByTiny(state => !state)
  }, [])

  const handleAddMore = async () => {
    const filePaths = await getFilesFromUser()

    filePaths && setImages(state => imagesStoreReducer(state, {
      type: imageStore.ADD,
      payload: pathsToImageObjects(filePaths)
    }))
  }

  const handleCheckChange = (key) => {
    setImages(state => imagesSelectReducer(state, {
      type: imageSelect.CHECK_CHANGE,
      payload: key
    }))
  }

  const handleCheckChangeAll = (e) => {
    const type = e.target.checked
      ? imageSelect.CHECK_ALL
      : imageSelect.UNCHECK_ALL

    setImages(state => imagesSelectReducer(state, {
      type,
      payload: state
    }))
  }

  const handleRemoveSlected = () => {
    setImages(state => imagesStoreReducer(state, {
      type: imageStore.REMOVE_SELECTED,
      payload: state
    }))
  }

  const handleCompress = () => {
    const filePaths = Array.from(images)
      .filter(([, { status }]) => status !== imageStatus.COMPRESSED)
      .map(([key]) => key)

    ipcRenderer.send('images:compress', outputPath, filePaths)
  }

  const rowByStatus = (status, meta) => {
    if (status === imageStatus.READY) {
      return (
        <div>READY</div>
      )
    }

    if (status === imageStatus.COMPRESSING) {
      return (
        <Fragment>
          <div>{filesize(meta.originalSize)}</div>
          <div>COMPRESSING</div>
        </Fragment>
      )
    }

    if (status === imageStatus.COMPRESSED) {
      return (
        <Fragment>
          <div>{filesize(meta.originalSize)}</div>
          <div>{filesize(meta.currentSize)}</div>
          <div>{meta.compressionRate}%</div>
        </Fragment>
      )
    }

    if (status === imageStatus.FAILED) {
      return (
        <div>FAILED</div>
      )
    }
    return (
      <div>IN PROGRESS...</div>
    )
  }

  return (
    <div className="App">
      <Pickers>
        <FilePicker
          label='Input Files'
          placeholder='No images selected'
          value={inputPath}
          onClick={handleInputPath} />
        <FilePicker
          label='Output Directory'
          placeholder='Select folder...'
          value={outputPath}
          onClick={handleOutputPath} />
      </Pickers>
      <TinyBar {...{ apiKey, handleApiKey, byTiny, handleByTiny }} />
      <ImagesList>
        <div>
          <div>
            <input
              type="checkbox"
              checked={images.size === selectedCount(images) && images.size !== 0}
              onChange={handleCheckChangeAll} />
          </div>
          <div>Filename</div>
          <div>Original Size</div>
          <div>Current Size</div>
          <div>Compressed</div>
        </div>
        {Array.from(images).map(([key, { status, selected, meta }]) => (
          <div key={key}>
            <div>
              <input
                type="checkbox"
                checked={selected}
                onChange={handleCheckChange.bind(null, key)} />
            </div>
            <div>{path.basename(key)}</div>
            {rowByStatus(status, meta)}
          </div>
        ))}
      </ImagesList>
      <Stack>
        <Button onClick={handleAddMore}>Add more</Button>
        <Button onClick={handleRemoveSlected}>Remove selected</Button>
        <Button onClick={handleCompress}>Compress images</Button>
      </Stack>
    </div>
  )
}

export default App
