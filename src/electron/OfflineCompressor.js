const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { eachLimit } = require('async')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const imageminGifsicle = require('imagemin-gifsicle')
const imageminSvgo = require('imagemin-svgo')
const WindowEventEmitter = require('./WindowEventEmitter')
const {
  imageStatus,
  COMPRESSION_STATUS
} = require('../constants')

const imageminPlugins = [
  imageminJpegtran(),
  imageminPngquant({ quality: [0.5, 0.8] }),
  imageminGifsicle({ optimizationLevel: 2 }),
  imageminSvgo()
]

class OfflineCompressor extends WindowEventEmitter {
  constructor (filePaths = [], dest) {
    super()

    this.filePaths = filePaths
    this.dest = dest
  }

  async compress () {
    this.emit(COMPRESSION_STATUS, true)

    await eachLimit(this.filePaths, 4, this.compressImage.bind(this))

    this.emit(COMPRESSION_STATUS, false)
  }

  async compressImage (filePath) {
    const meta = { filePath }

    try {
      const image = await promisify(fs.readFile)(filePath)
      const imageBuffer = Buffer.from(image)
      meta.originalSize = Buffer.byteLength(imageBuffer)

      this.emit(imageStatus.COMPRESSING, meta)

      const compressedImage = await imagemin.buffer(imageBuffer, {
        plugins: imageminPlugins
      })
      meta.currentSize = Buffer.byteLength(compressedImage)

      await promisify(fs.writeFile)(
        path.join(this.dest, path.basename(filePath)),
        compressedImage
      )

      this.emit(imageStatus.COMPRESSED, meta)
    } catch (err) {
      meta.error = 'Error compressing file.'

      this.emit(imageStatus.FAILED, meta)
    }
  }
}

module.exports = OfflineCompressor
