const fs = require('fs')
const path = require('path')
const { remote, ipcRenderer, contextBridge, shell } = require('electron')
const { getImagesFromUser, getDirectoryFromUser } = remote.require('./electron/dialogs.js')

const apiKey = fs.readFileSync(path.resolve(__dirname, '../../.key'))
  .toString()
  .trim()

contextBridge.exposeInMainWorld('tinify', {
  apiKey
})

contextBridge.exposeInMainWorld('dialog', {
  getImagesFromUser,
  getDirectoryFromUser
})

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (event, data) => ipcRenderer.on(event, data),
  send: (channel, arg) => ipcRenderer.send(channel, arg)
})

contextBridge.exposeInMainWorld('shell', {
  openTinyPngApiDocs: () => {
    shell.openExternal('https://tinypng.com/developers')
  }
})
