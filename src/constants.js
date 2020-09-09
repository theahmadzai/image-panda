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

module.exports.READY_TO_COMPRESS = 'READY_TO_COMPRESS'
module.exports.COMPRESSION_START = 'COMPRESSION_START'
module.exports.COMPRESSION_STATUS = 'COMPRESSION_DONE'
module.exports.COMPRESSION_COUNT = 'COMPRESSION_COUNT'
