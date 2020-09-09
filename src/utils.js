import { READY_TO_COMPRESS } from './constants'

export const filePathsToImages = filePaths => new Map(filePaths.map(filePath => (
  [filePath, {
    status: READY_TO_COMPRESS,
    selected: false,
    meta: {
      originalSize: 0,
      currentSize: 0,
      error: ''
    }
  }]
)))
