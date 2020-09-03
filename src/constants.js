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
  STARTED: 0,
  COMPRESSING: 1,
  COMPRESSED: 2,
  FAILED: 3
})
