const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const { promisify } = require('util')
const tinify = require('tinify')
const { imageStatus } = require('./../src/constants')

class Tinify extends EventEmitter {
  constructor (apiKey, filePaths = [], dest) {
    super()

    tinify.key = apiKey

    this.filePaths = filePaths
    this.sources = []
    this.dest = dest
    this.uploading = 0
    this.downloading = 0
    this.compressionCount = 0
  }

  static getNextAllowed (arr = [], inProgress = 0) {
    return Array.prototype.splice.call(
      arr, 0, Math.abs(Tinify.MAX_ALLOWED - inProgress)
    )
  }

  static getErrorMessage (err) {
    if (err instanceof tinify.AccountError) {
      return 'Verify your API key and account limit.'
    } else if (err instanceof tinify.ClientError) {
      return 'Check your source image and request options.'
    } else if (err instanceof tinify.ServerError) {
      return 'Temporary issue with the Tinify API.'
    } else if (err instanceof tinify.ConnectionError) {
      return 'A network connection error occurred.'
    } else if (Object.prototype.hasOwnProperty.call(err, 'message')) {
      return err.message
    }
    return 'Unable to read data from file.'
  }

  forwardEventsToWindow (win) {
    Object.keys(imageStatus).forEach(status => {
      this.on(status, msg => {
        win.webContents.send(status, msg)
      })
    })

    this.on('cmpcount', msg => {
      win.webContents.send('cmpcount', msg)
    })
  }

  nextFilePaths () {
    return Tinify.getNextAllowed(this.filePaths, this.uploading)
  }

  nextSources () {
    return Tinify.getNextAllowed(this.sources, this.downloading)
  }

  imageUploaded () {
    this.uploading -= 1
    this.uploadImages()

    if (this.downloading <= Tinify.MAX_ALLOWED) {
      this.downloadImages()
    }
  }

  imageDownloaded () {
    this.downloading -= 1
    this.downloadImages()
  }

  uploadImages () {
    const filePaths = this.nextFilePaths()

    if (filePaths.length === 0) return

    Array.prototype.forEach.call(filePaths, this.uploadImage.bind(this))
  }

  downloadImages () {
    const sources = this.nextSources()

    if (sources.length === 0) return

    Array.prototype.forEach.call(sources, this.downloadImage.bind(this))
  }

  async uploadImage (filePath) {
    this.uploading += 1
    const meta = { filePath }

    try {
      this.emit(imageStatus.STARTED, meta)

      const image = await promisify(fs.readFile)(filePath)
      const imageBuffer = Buffer.from(image)
      meta.originalSize = Buffer.byteLength(imageBuffer)

      const source = await tinify.fromBuffer(imageBuffer)

      this.emit(imageStatus.COMPRESSING, meta)

      this.sources.push({ source, meta })
    } catch (err) {
      this.uploading -= 1
      meta.error = Tinify.getErrorMessage(err)

      this.emit(imageStatus.FAILED, meta)
    } finally {
      this.imageUploaded()
    }
  }

  async downloadImage ({ source, meta }) {
    this.downloading += 1

    try {
      const compressedImage = await source.result()
      meta.currentSize = await compressedImage.size()

      await compressedImage.toFile(
        path.resolve(this.dest, path.basename(meta.filePath))
      )

      this.emit(imageStatus.COMPRESSED, meta)
      this.emit('COMPRESSIONCOUNT', tinify.compressionCount)
    } catch (err) {
      this.downloading -= 1
      meta.error = Tinify.getErrorMessage(err)

      this.emit(imageStatus.FAILED, meta)
    } finally {
      this.imageDownloaded()
    }
  }

  compress () {
    this.uploadImages()
  }
}

Tinify.MAX_ALLOWED = 10

module.exports = Tinify
