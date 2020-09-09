import { READY_TO_COMPRESS } from './constants'

export const pathsToImageObjects = paths => new Map(paths.map(path => ([path, {
  status: READY_TO_COMPRESS,
  selected: false,
  meta: {
    originalSize: 0,
    currentSize: 0,
    error: ''
  }
}])))
