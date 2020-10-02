const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const tinify = require('tinify')
const Compressor = require('./Compressor')
const { imageStatus, COMPRESSION_COUNT } = require('../constants/common')

class TinifyCompressor extends Compressor {
  constructor(apiKey, filePaths = [], dest) {
    super(filePaths, dest)

    tinify.key = apiKey

    this.MAX_ALLOWED = 20
  }

  static getErrorMessage(err) {
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

  async compressImage(filePath) {
    const meta = { filePath, originalSize: 0, currentSize: 0 }

    try {
      const image = await promisify(fs.readFile)(filePath)
      const imageBuffer = Buffer.from(image)
      meta.originalSize = Buffer.byteLength(imageBuffer)

      this.emit(imageStatus.COMPRESSING, meta)

      const source = await tinify.fromBuffer(imageBuffer)
      const compressedImage = await source.result()
      meta.currentSize = await compressedImage.size()

      await compressedImage.toFile(
        path.resolve(this.dest, path.basename(meta.filePath))
      )

      this.emit(imageStatus.COMPRESSED, meta)
      this.emit(COMPRESSION_COUNT, tinify.compressionCount)

      this.bytesSaved += meta.originalSize - meta.currentSize
    } catch (err) {
      meta.error = TinifyCompressor.getErrorMessage(err)

      this.emit(imageStatus.FAILED, meta)
    }
  }
}

module.exports = TinifyCompressor
