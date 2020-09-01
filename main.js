const { app, dialog, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const Tinify = require('./electron/Tinify')
const OfflineCompressor = require('./electron/OfflineCompressor')

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    show: false,
    // icon: path.join(__dirname, 'public/logo.svg'),
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(__dirname, 'electron/preload.js')
    }
  })

  mainWindow.loadURL(isDev
    ? 'http://127.0.0.1:3000'
    : `file://${path.join(__dirname, 'build/index.html')}`)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('COMPRESS', (e, tinify, apiKey, filePaths, outputPath) => {
  if (filePaths.length <= 0) {
    dialog.showErrorBox('No files selected', 'You must select files first.')
    return
  }

  fs.access(outputPath, fs.constants.F_OK, err => {
    if (err) {
      dialog.showErrorBox('Invalid output directory', 'Output directory not readable.')
      return
    }

    const compressor = selectCompressor(tinify, apiKey, filePaths, outputPath)
    compressor.forwardEventsToWindow(mainWindow)
    compressor.compress()
  })
})

const selectCompressor = (tinify, apiKey, filePaths = [], dest) => {
  if (tinify) {
    fs.writeFile(path.join(__dirname, '.key'), apiKey, 'utf-8', (err) => {
      if (err) {} // ignore
    })

    return new Tinify(apiKey, filePaths, dest)
  }

  return new OfflineCompressor(filePaths, dest)
}
