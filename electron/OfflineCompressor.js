const fs = require('fs')
const path = require('path')
const EventEmitter = require('events')
const { promisify } = require('util')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const imageminGifsicle = require('imagemin-gifsicle')
const imageminSvgo = require('imagemin-svgo')
const { imageStatus } = require('./../src/constants')

const imageminPlugins = [
  imageminJpegtran(),
  imageminPngquant({ quality: [0.5, 0.8] }),
  imageminGifsicle({ optimizationLevel: 2 }),
  imageminSvgo()
]

class OfflineCompressor extends EventEmitter {
  constructor (filePaths = [], dest) {
    super()

    this.filePaths = filePaths
    this.dest = dest
  }

  forwardEventsToWindow (win) {
    Array.prototype.forEach.call(Object.keys(imageStatus), status => {
      this.on(status, msg => {
        win.webContents.send(status, msg)
      })
    })
  }

  compress () {
    Array.prototype.forEach.call(this.filePaths, this.compressImage.bind(this))
  }

  async compressImage (filePath) {
    const meta = { filePath }

    try {
      this.emit(imageStatus.STARTED, meta)

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
