const { autoUpdater, app, dialog } = require('electron')
const isDev = require('electron-is-dev')
const logger = require('electron-log')
const { APP_NAME } = require('../constants')

const server = 'https://update.electronjs.org'
const repo = 'theahmadzai/image-panda'
const updateInterval = 1000 * 3600 // 1 hour

let updateChecker = null

const updater = (checkForUpdates = true) => {
  if (isDev) return

  if (typeof process !== 'undefined' && process.platform &&
    !(['darwin', 'win32'].includes(process.platform))) {
    return // platform not supported
  }

  if (!checkForUpdates) {
    if (updateChecker) {
      clearInterval(updateChecker)
    }
    return
  }

  autoUpdater.setFeedURL({
    url: `${server}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`
  })

  autoUpdater.on('update-downloaded',
    (event, releaseNotes, releaseName, releaseDate, updateUrl) => {
      const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: `${APP_NAME} Update`,
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: `A new version of ${APP_NAME} has been downloaded. Restart the application to apply the updates.`
      }

      dialog.showMessageBox(dialogOpts).then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall()
      })
    }
  )

  autoUpdater.checkForUpdates()

  updateChecker = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, updateInterval)
}

module.exports = updater
