const { app, dialog, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const FilePool = require('./electron/FilePool')
// const compressImages = require('compress-images')

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

  // mainWindow.webContents.openDevTools()
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

    compress(tinify, apiKey, filePaths, outputPath)
  })
})

const compress = (tinify, apiKey, filePaths = [], dest) => {
  if (tinify) {
    fs.writeFile(path.join(__dirname, '.key'), apiKey.toString(), 'utf-8', (err) => {
      if (err) {
        // ignore
      }
    })

    new FilePool(mainWindow, apiKey, filePaths, dest).compress()
    return
  }

  console.log('OFFLINE COMPRESS')
  // compressImages(
  //   images[0].replace(/\\/g, '/'),
  //   dest.replace(/\\/g, '/') + '/',
  //   {
  //     compress_force: false,
  //     statistic: true,
  //     autoupdate: false
  //   },
  //   false,
  //   {
  //     jpg: {
  //       engine: 'mozjpeg', command: ['-quality', '60']
  //     }
  //   },
  //   {
  //     png:
  //       { engine: 'pngquant', command: ['--quality=20-50', '-o'] }
  //   },
  //   {
  //     svg:
  //       { engine: 'svgo', command: '--multipass' }
  //   },
  //   {
  //     gif:
  //       { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] }
  //   },
  //   function (error, completed, statistic) {
  //     console.log('-------------')
  //     console.log(error)
  //     console.log(completed)
  //     console.log(statistic)
  //     console.log('-------------')
  //   }
  // )
}
