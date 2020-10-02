const { ipcRenderer, contextBridge, shell } = require('electron')
// const {
//   GET_IMAGES_FROM_USER,
//   GET_DIRECTORY_FROM_USER,
// } = require('./constants/common')

const openTinyPngApiDocs = () => {
  shell.openExternal('https://tinypng.com/developers')
}

const getImagesFromUser = async () => {
  return await ipcRenderer.invoke('GET_IMAGES_FROM_USER')
}
const getDirectoryFromUser = async () => {
  return await ipcRenderer.invoke('GET_DIRECTORY_FROM_USER')
}

const ipc = {
  on: (event, data) => ipcRenderer.on(event, data),
  send: (channel, arg) => ipcRenderer.send(channel, arg),
}

contextBridge.exposeInMainWorld('electron', {
  openTinyPngApiDocs,
  dialog: {
    getImagesFromUser,
    getDirectoryFromUser,
  },
  ipc,
})
