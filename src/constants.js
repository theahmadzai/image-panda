const path = require('path')

module.exports.imageActionType = Object.freeze({
  SET: 0,
  ADD: 1,
  REMOVE_SELECTED: 2,
  CHECK_CHANGE: 3,
  CHECK_CHANGE_ALL: 4,
  CHANGE_STATUS: 5
})

module.exports.imageStatus = Object.freeze({
  COMPRESSING: 'COMPRESSING',
  COMPRESSED: 'COMPRESSED',
  FAILED: 'FAILED'
})

module.exports.ICON_PATH = path.join(__dirname, '../public/icon.png')
module.exports.APP_NAME = 'Image Panda'
module.exports.READY_TO_COMPRESS = 'READY_TO_COMPRESS'
module.exports.COMPRESSION_START = 'COMPRESSION_START'
module.exports.COMPRESSION_STATUS = 'COMPRESSION_STATUS'
module.exports.COMPRESSION_COUNT = 'COMPRESSION_COUNT'
module.exports.GET_IMAGES_FROM_USER = 'GET_IMAGES_FROM_USER'
module.exports.GET_DIRECTORY_FROM_USER = 'GET_DIRECTORY_FROM_USER'
