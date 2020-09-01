module.exports.imageStore = Object.freeze({
  ADD: 0,
  UPDATE: 1,
  REMOVE_SELECTED: 2
})

module.exports.imageSelect = Object.freeze({
  CHECK_CHANGE: 0,
  CHECK_ALL: 1,
  UNCHECK_ALL: 2
})

module.exports.imageStatus = Object.freeze({
  STARTED: 'STARTED',
  COMPRESSING: 'COMPRESSING',
  COMPRESSED: 'COMPRESSED',
  FAILED: 'FAILED'
})
