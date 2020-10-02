const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const Sentry = require('@sentry/electron')
const storage = require('./electron/storage')
const logger = require('./electron/logger')
const updater = require('./electron/updater')
const menu = require('./electron/menu')
const TinifyCompressor = require('./electron/TinifyCompressor')
const OfflineCompressor = require('./electron/OfflineCompressor')
const {
  getImagesFromUser,
  getDirectoryFromUser,
} = require('./electron/dialogs.js')
const {
  imageStatus,
  COMPRESSION_START,
  COMPRESSION_STATUS,
  COMPRESSION_COUNT,
  GET_IMAGES_FROM_USER,
  GET_DIRECTORY_FROM_USER,
} = require('./constants/common')
const { ICON_PATH } = require('./constants/electron')

if (require('electron-squirrel-startup')) {
  app.quit()
}

const eventList = [
  ...Object.values(imageStatus),
  COMPRESSION_STATUS,
  COMPRESSION_COUNT,
]

logger.log('main: starting app')

Sentry.init({
  dsn:
    'https://bdbb83d8ca1c4fab9bdb7d92eada13b2@o449876.ingest.sentry.io/5433630',
})

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
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  logger.log('main: version =', app.getVersion())

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  const checkForUpdates = storage.get('checkForUpdates', true)
  updater(checkForUpdates)
  logger.log('main: checkForUpdates =', checkForUpdates)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle(GET_IMAGES_FROM_USER, getImagesFromUser)

ipcMain.handle(GET_DIRECTORY_FROM_USER, getDirectoryFromUser)

ipcMain.on(
  COMPRESSION_START,
  async (e, { filePaths = [], app: { useTinify, apiKey, outputPath } }) => {
    logger.log('main: compression started on', filePaths.length, 'image(s)')
    logger.log('main: compression options: ', { useTinify, apiKey, outputPath })

    if (filePaths.length <= 0) {
      dialog.showErrorBox(
        'No files to compress',
        'No uncompressed files preset, Please add files to compress.'
      )
      return
    }

    try {
      await promisify(fs.access)(outputPath, fs.constants.F_OK)

      const compressor = selectCompressor(
        useTinify,
        apiKey,
        filePaths,
        outputPath
      )
      compressor.forwardEventsToWindow(eventList, mainWindow)
      compressor.compress()

      logger.log('main: compressing images')
    } catch (err) {
      logger.log('main: ', err)

      dialog.showErrorBox(
        'Invalid output directory',
        'Output directory does not exist or is not readable.'
      )
    }
  }
)

const selectCompressor = (useTinify = false, apiKey, filePaths = [], dest) => {
  if (useTinify) {
    logger.log('main: using tinify compessor ->', dest)
    return new TinifyCompressor(apiKey, filePaths, dest)
  }

  logger.log('main: using offline compressor ->', dest)
  return new OfflineCompressor(filePaths, dest)
}
