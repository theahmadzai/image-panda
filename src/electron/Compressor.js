const { eachLimit } = require('async')
const WindowEventEmitter = require('./WindowEventEmitter')
const { COMPRESSION_STATUS } = require('../constants')

class Compressor extends WindowEventEmitter {
  constructor (filePaths = [], dest) {
    super()

    this.MAX_ALLOWED = 10
    this.filePaths = filePaths
    this.dest = dest
    this.bytesSaved = 0
    this.startTime = new Date()
  }

  async compress () {
    this.emit(COMPRESSION_STATUS, true)

    await eachLimit(
      this.filePaths,
      this.MAX_ALLOWED,
      this.compressImage.bind(this)
    )

    this.emit(COMPRESSION_STATUS, false)

    this.notify({
      imagesCompressed: this.filePaths.length,
      bytesSaved: this.bytesSaved,
      timeTaken: new Date(new Date() - this.startTime)
    })
  }
}

module.exports = Compressor
