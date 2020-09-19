const { BrowserWindow, Menu, app, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const Sentry = require('@sentry/electron')
const updater = require('./electron/updater')
const menu = require('./electron/menu')
const { getImagesFromUser, getDirectoryFromUser } = require('./electron/dialogs.js')
const TinifyCompressor = require('./electron/TinifyCompressor')
const OfflineCompressor = require('./electron/OfflineCompressor')
const {
  imageStatus,
  ICON_PATH,
  COMPRESSION_START,
  COMPRESSION_STATUS,
  COMPRESSION_COUNT,
  GET_IMAGES_FROM_USER,
  GET_DIRECTORY_FROM_USER
} = require('./constants')

const eventList = [
  ...Object.values(imageStatus),
  COMPRESSION_STATUS,
  COMPRESSION_COUNT
]

if (require('electron-squirrel-startup')) {
  app.quit()
}

Sentry.init({ dsn: 'https://bdbb83d8ca1c4fab9bdb7d92eada13b2@o449876.ingest.sentry.io/5433630' })

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.resolve(__dirname, 'electron/preload.js')
    }
  })

  Menu.setApplicationMenu(
    Menu.buildFromTemplate(menu)
  )

  if (isDev) mainWindow.loadURL('http://127.0.0.1:3000')
  else mainWindow.loadFile(path.join(__dirname, '../build/index.html'))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  updater()
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle(GET_IMAGES_FROM_USER, getImagesFromUser)

ipcMain.handle(GET_DIRECTORY_FROM_USER, getDirectoryFromUser)

ipcMain.on(COMPRESSION_START, (e, { filePaths, app: { useTinify, apiKey, outputPath } }) => {
  if (filePaths.length <= 0) {
    dialog.showErrorBox(
      'No files to compress',
      'No uncompressed files preset, Please add files to compress.'
    )
    return
  }

  fs.access(outputPath, fs.constants.F_OK, err => {
    if (err) {
      dialog.showErrorBox(
        'Invalid output directory',
        'Output directory does not exist or is not readable.'
      )
      return
    }

    const compressor = selectCompressor(useTinify, apiKey, filePaths, outputPath)
    compressor.forwardEventsToWindow(eventList, mainWindow)
    compressor.compress()
  })
})

const selectCompressor = (useTinify, apiKey, filePaths = [], dest) => {
  if (useTinify) {
    return new TinifyCompressor(apiKey, filePaths, dest)
  }

  return new OfflineCompressor(filePaths, dest)
}
