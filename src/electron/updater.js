const { autoUpdater, app, dialog } = require('electron')
const isDev = require('electron-is-dev')
const logger = require('./logger')
const { APP_NAME } = require('../constants/common')

const server = 'https://update.electronjs.org'
const repo = 'theahmadzai/image-panda'
const updateInterval = 1000 * 3600

let updateChecker = null

const updater = (checkForUpdates = true) => {
  if (isDev) return

  if (!app.isReady()) {
    logger.log('updater: initialized updater when app not ready')
    return
  }

  if (
    typeof process !== 'undefined' &&
    process.platform &&
    !['darwin', 'win32'].includes(process.platform)
  ) {
    logger.log(
      `updater: electron's autoUpdater does not support the ${process.platform} platform`
    )
    return
  }

  if (!checkForUpdates) {
    if (updateChecker) {
      logger.log('updater: stop checking for updates')
      clearInterval(updateChecker)
    }
    return
  }

  const url = `${server}/${repo}/${process.platform}-${
    process.arch
  }/${app.getVersion()}`

  logger.log('updater: url =', url)
  autoUpdater.setFeedURL({ url })

  autoUpdater.on('error', err => {
    logger.log('updater: error: ', err)
  })

  autoUpdater.on('checking-for-update', () => {
    logger.log('updater: checking-for-update')
  })

  autoUpdater.on('update-available', () => {
    logger.log('updater: update-available')
  })

  autoUpdater.on('update-not-available', () => {
    logger.log('updater: update-not-available')
  })

  autoUpdater.on('before-quit-for-update', () => {
    logger.log('updater: before-quit-for-update')
  })

  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    logger.log('updater: update-downloaded', [event, releaseNotes, releaseName])

    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: `${APP_NAME} Update`,
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: `A new version of ${APP_NAME} has been downloaded. Restart the application to apply the updates.`,
    }

    dialog.showMessageBox(dialogOpts).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })

  logger.log('updater: start checking for updates')
  autoUpdater.checkForUpdates()

  updateChecker = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, updateInterval)
}

module.exports = updater
