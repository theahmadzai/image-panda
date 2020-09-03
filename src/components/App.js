import React, { useState, useEffect, useCallback, Fragment } from 'react'
import filesize from 'filesize'
import styled from '@emotion/styled'
import { imageStore, imageSelect, imageStatus } from '../constants'
import { baseGrid } from '../styles'
import { Stack, Button } from '../elements'
import FilePicker from './FilePicker'
import TinyBar from './TinyBar'
const { ipcRenderer, remote, shell } = window.require('electron')
const { getImagesFromUser, getDirectoryFromUser } = remote.require('./electron/dialogs.js')

const Grid = styled.div`
  ${baseGrid}

  grid-template-columns: auto auto;
`

const ImagesList = styled.div`
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
    error: ''
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

const imagesStatusReducer = (state = new Map(), { type, payload }) => {
  const key = payload.filePath
  const meta = { ...payload }
  delete meta.filePath

  if (Object.prototype.hasOwnProperty.call(imageStatus, type)) {
    return new Map([...state, [key, {
      status: type,
      selected: state.get(key).selected,
      meta: { ...state.get(key).meta, ...meta }
    }]])
  }

  return state
}

const App = () => {
  const [images, setImages] = useState(new Map())
  const [inputPath, setInputPath] = useState('')
  const [outputPath, setOutputPath] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [tinify, setTinify] = useState(false)
  const [compressionCount, setCompressionCount] = useState(null)

  useEffect(() => {
    setInputPath(state => {
      if (images.size === 0) return ''
      if (images.size === 1) return images.keys().next().value
      return `${images.size} images selected`
    })
  }, [images, setInputPath])

  useEffect(() => {
    if (window.TINY_API_KEY && window.TINY_API_KEY.length) {
      setApiKey(window.TINY_API_KEY)
      setTinify(true)
    }

    Object.keys(imageStatus).forEach(status => {
      ipcRenderer.on(status, (e, meta) => {
        setImages(state => imagesStatusReducer(state, {
          type: status,
          payload: meta
        }))
      })
    })

    ipcRenderer.on('cmpcount', (e, count) => {
      setCompressionCount(count)
    })
  }, [])

  const handleInputPath = useCallback(async () => {
    const filePaths = await getImagesFromUser()

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

  const handleTinify = useCallback(() => {
    if (!tinify && (!apiKey.trim() || apiKey.length === 0)) {
      shell.openExternal('https://tinypng.com/developers')
    }
    setTinify(state => !state)
  }, [tinify, apiKey])

  const handleAddMore = async () => {
    const filePaths = await getImagesFromUser()

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

    ipcRenderer.send('COMPRESS', tinify, apiKey, filePaths, outputPath)
  }

  const rowByStatus = (status, meta) => {
    if (status === imageStatus.STARTED) {
      return (
        <div>STARTED</div>
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
      meta.savedSize = meta.originalSize - meta.currentSize
      meta.savedPercentage = Math.ceil(((meta.currentSize / meta.originalSize) * 100) - 100)

      return (
        <Fragment>
          <div>{filesize(meta.originalSize)}</div>
          <div>{filesize(meta.currentSize)}</div>
          <div>{filesize(meta.savedSize)} ({meta.savedPercentage}%)</div>
        </Fragment>
      )
    }

    if (status === imageStatus.FAILED) {
      return (
        <Fragment>
          <div>FAILED</div>
          <div>{meta.error}</div>
        </Fragment>
      )
    }

    return (
      <div>READY</div>
    )
  }

  return (
    <div className="App">
      <Grid>
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
      </Grid>
      <TinyBar {...{ compressionCount, apiKey, handleApiKey, tinify, handleTinify }} />
      <ImagesList>
        <div>
          <div>
            <input
              type="checkbox"
              checked={images.size === selectedCount(images) && images.size !== 0}
              onChange={handleCheckChangeAll} />
          </div>
          <div>File Name</div>
          <div>Original Size</div>
          <div>Current Size</div>
          <div>Saved</div>
        </div>
        {Array.from(images).map(([key, { status, selected, meta }]) => (
          <div key={key}>
            <div>
              <input
                type="checkbox"
                checked={selected}
                onChange={handleCheckChange.bind(null, key)} />
            </div>
            <div>{key.substring(key.lastIndexOf('\\') + 1)}</div>
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
