const fs = require('fs')
const path = require('path')
const { ipcRenderer, contextBridge, shell } = require('electron')

const readApiKey = () => {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../../.key'))
      .toString()
      .trim()
  } catch (err) {
    // ignore
  }
}

contextBridge.exposeInMainWorld('tinify', {
  apiKey: readApiKey()
})

contextBridge.exposeInMainWorld('dialog', {
  getImagesFromUser: async () => await ipcRenderer.invoke('GET_IMAGES_FROM_USER'),
  getDirectoryFromUser: async () => await ipcRenderer.invoke('GET_DIRECTORY_FROM_USER')
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
