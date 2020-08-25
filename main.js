const { app, dialog, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
// const compressImages = require('compress-images')
const tinify = require('tinify')
tinify.key = fs.readFileSync(path.join(__dirname, '.key'), 'utf-8')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 400,
    show: false,
    webPreferences: {
      nodeIntegration: true
      // preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.webContents.openDevTools()
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

ipcMain.on('images:compress', (e, outputPath, images) => {
  if (images.length <= 0) {
    dialog.showErrorBox('No files selected', 'You must select files first.')
    return
  }

  fs.access(outputPath, fs.constants.F_OK, err => {
    if (err) {
      dialog.showErrorBox('Invalid output directory', 'Output directory not readable.')
      return
    }

    compress(images, outputPath)
  })
})

const compress = (images, dest) => {
  const info = {
    sizeBefore: 0,
    sizeAfter: 0,
    compressed: 0
  }

  const a = tinify.fromFile(images[0])
  a.toFile(dest + '/' + path.basename(images[0]))
    .then(i => {
      console.log(i)
    })
    .catch(console.log)

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
