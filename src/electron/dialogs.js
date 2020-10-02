const { dialog, BrowserWindow } = require('electron')

const inputPathOptions = {
  filters: [
    {
      name: 'Images',
      extensions: ['jpg', 'png', 'gpeg', 'gif', 'svg'],
    },
  ],
  properties: ['multiSelections'],
}

const outputPathOptions = {
  properties: ['openDirectory'],
}

const openDialog = options => {
  return dialog
    .showOpenDialog(BrowserWindow.getFocusedWindow(), options)
    .then(({ canceled, filePaths }) => {
      return !canceled && filePaths.length && filePaths
    })
}

const getImagesFromUser = () => {
  return openDialog(inputPathOptions).catch(() => {
    dialog.showErrorBox('Error opening files', 'Failed to open image file.')
  })
}

const getDirectoryFromUser = () => {
  return openDialog(outputPathOptions)
    .then(filePaths => filePaths && filePaths[0])
    .catch(() => {
      dialog.showErrorBox(
        'Error selecting directory',
        'Failed to select a directory.'
      )
    })
}

module.exports = {
  getImagesFromUser,
  getDirectoryFromUser,
}
