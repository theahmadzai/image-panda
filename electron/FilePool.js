const path = require('path')
const fs = require('fs')
const tinify = require('tinify')
const { imageStatus } = require('./../src/constants')

function FilePool (mainWindow, apiKey, filePaths = [], dest) {
  tinify.key = apiKey.toString().trim()

  this.mainWindow = mainWindow
  this.filePaths = filePaths
  this.sources = []
  this.dest = dest
  this.uploading = 0
  this.downloading = 0
  this.compressionCount = 0
}

FilePool.MAX_ALLOWED = 10

FilePool.getErrorMessage = (err) => {
  if (err instanceof tinify.AccountError) {
    return 'Verify your API key and account limit.'
  } else if (err instanceof tinify.ClientError) {
    return 'Check your source image and request options.'
  } else if (err instanceof tinify.ServerError) {
    return 'Temporary issue with the Tinify API.'
  } else if (err instanceof tinify.ConnectionError) {
    return 'A network connection error occurred.'
  } else {
    return err.message
  }
}

FilePool.prototype.compress = function () {
  this.uploadImages()
}

FilePool.prototype.getNextAllowed = function (arr = [], inProgress = 0) {
  return Array.prototype.splice.call(
    arr, 0, Math.abs(FilePool.MAX_ALLOWED - inProgress)
  )
}

FilePool.prototype.nextFilePaths = function () {
  return this.getNextAllowed(this.filePaths, this.uploading)
}

FilePool.prototype.nextSources = function () {
  return this.getNextAllowed(this.sources, this.downloading)
}

FilePool.prototype.uploaded = function () {
  this.uploading -= 1
  this.uploadImages()

  if (this.downloading <= FilePool.MAX_ALLOWED) {
    this.downloadImages()
  }
}

FilePool.prototype.downloaded = function () {
  this.downloading -= 1
  this.downloadImages()
}

FilePool.prototype.uploadImages = function () {
  const filePaths = this.nextFilePaths()

  if (filePaths.length === 0) return

  Array.prototype.forEach.call(filePaths, this.uploadImage.bind(this))
}

FilePool.prototype.uploadImage = function (filePath) {
  const mainWindow = this.mainWindow
  this.uploading += 1
  const meta = { filePath }

  fs.readFile(filePath, async (err, data) => {
    if (err) {
      this.uploading -= 1
      mainWindow.webContents.send(imageStatus.FAILED, meta)
      this.uploaded()
      return
    }

    try {
      mainWindow.webContents.send(imageStatus.STARTED, meta)

      const imageBuffer = Buffer.from(data)
      meta.originalSize = Buffer.byteLength(imageBuffer)

      mainWindow.webContents.send(imageStatus.UPLOADING, meta)

      const source = await tinify.fromBuffer(imageBuffer)

      mainWindow.webContents.send(imageStatus.COMPRESSING, meta)
      this.sources.push({ source, meta })
    } catch (err) {
      this.uploading -= 1

      meta.error = FilePool.getErrorMessage(err)
      mainWindow.webContents.send(imageStatus.FAILED, meta)
    } finally {
      this.uploaded()
    }
  })
}

FilePool.prototype.downloadImages = function () {
  const sources = this.nextSources()

  if (sources.length === 0) return

  Array.prototype.forEach.call(sources, this.downloadImage.bind(this))
}

FilePool.prototype.downloadImage = async function ({ source, meta }) {
  const mainWindow = this.mainWindow
  this.downloading += 1

  try {
    const image = await source.result()

    meta.currentSize = await image.size()
    meta.savedSize = meta.originalSize - meta.currentSize
    meta.savedPercentage = Math.ceil(((meta.currentSize / meta.originalSize) * 100) - 100)

    image.toFile(path.resolve(this.dest, path.basename(meta.filePath)))
    mainWindow.webContents.send(imageStatus.COMPRESSED, meta)
    mainWindow.webContents.send('COMPRESSIONCOUNT', await tinify.compressionCount)
  } catch (err) {
    this.downloading -= 1

    meta.error = FilePool.getErrorMessage(err)
    mainWindow.webContents.send(imageStatus.FAILED, meta)
  } finally {
    this.downloaded()
  }
}

module.exports = FilePool
