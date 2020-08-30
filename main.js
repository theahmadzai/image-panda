const { app, dialog, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = require('electron-is-dev')
const filesize = require('filesize')
// const compressImages = require('compress-images')
const tinify = require('tinify')
tinify.key = fs.readFileSync(path.join(__dirname, '.key'), 'utf-8').trim()

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    show: false,
    // icon: path.join(__dirname, 'public/logo.svg'),
    webPreferences: {
      nodeIntegration: true
      // preload: path.join(__dirname, 'preload.js')
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

const compress = (filePaths = [], dest) => {
  Array.prototype.forEach.call(filePaths, (filePath) => {
    fs.readFile(filePath, async (err, data) => {
      if (err) throw err

      const meta = {
        originalSize: 0,
        currentSize: 0,
        compressionRate: 0
      }

      const imageBuffer = Buffer.from(data)
      meta.originalSize = Buffer.byteLength(imageBuffer)
      mainWindow.webContents.send('image:compressing', { filePath, meta })

      const source = await tinify.fromBuffer(imageBuffer).result()
      meta.currentSize = await source.size()
      meta.compressionRate = Math.ceil(((meta.currentSize / meta.originalSize) * 100) - 100)

      await source.toFile(path.resolve(dest, path.basename(filePath)))

      mainWindow.webContents.send('image:compressed', { filePath, meta })

      console.log('----------')
      console.log('Before: ', filesize(meta.originalSize))
      console.log('After: ', filesize(meta.currentSize))
      console.log('Compression: ', meta.compressionRate + '%')
      console.log(filePath)
      console.log(path.resolve(dest, path.basename(filePath)))
    })
  })

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

const inputPathOptions = {
  filters: [
    { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
    { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
    { name: 'Custom File Type', extensions: ['as'] },
    { name: 'All Files', extensions: ['*'] }
  ],
  properties: [
    'multiSelections'
  ]
}

exports.getFilesFromUser = () => {
  return dialog.showOpenDialog(mainWindow, inputPathOptions)
    .then(({ canceled, filePaths }) => {
      if (canceled || filePaths.length < 1) return

      return filePaths
    })
    .catch(() => {
      dialog.showErrorBox('Error opening files', 'Failed to open image file.')
    })
}

const outputPathOptions = {
  title: 'Output path',
  properties: [
    'openDirectory'
  ]
}

exports.getDirectoryFromUser = () => {
  return dialog.showOpenDialog(mainWindow, outputPathOptions)
    .then(({ canceled, filePaths }) => {
      if (canceled || filePaths.length < 1) return

      return filePaths[0]
    })
    .catch(() => {
      dialog.showErrorBox('Error selecting directory', 'Failed to select a directory.')
    })
}
