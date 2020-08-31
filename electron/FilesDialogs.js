const { dialog } = require('electron')

const inputPathOptions = {
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gpeg', 'gif', 'svg'] }
  ],
  properties: [
    'multiSelections'
  ]
}

exports.getFilesFromUser = () => {
  return dialog.showOpenDialog(null, inputPathOptions)
    .then(({ canceled, filePaths }) => {
      if (canceled || filePaths.length < 1) return

      return filePaths
    })
    .catch(() => {
      dialog.showErrorBox('Error opening files', 'Failed to open image file.')
    })
}

const outputPathOptions = {
  properties: [
    'openDirectory'
  ]
}

exports.getDirectoryFromUser = () => {
  return dialog.showOpenDialog(null, outputPathOptions)
    .then(({ canceled, filePaths }) => {
      if (canceled || filePaths.length < 1) return

      return filePaths[0]
    })
    .catch(() => {
      dialog.showErrorBox('Error selecting directory', 'Failed to select a directory.')
    })
}
