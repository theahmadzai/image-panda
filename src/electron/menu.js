const { shell } = require('electron')
const isDev = require('electron-is-dev')
const storage = require('./storage')
const updater = require('./updater')
const { APP_NAME } = require('../constants/common')

const isMac = process.platform === 'darwin'

const menu = [
  ...(isMac
    ? [
        {
          label: APP_NAME,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : []),
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' },
          ]
        : [{ role: 'close' }]),
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Learn more',
        click: async () =>
          await shell.openExternal(
            'https://github.com/theahmadzai/image-panda'
          ),
      },
      { type: 'separator' },
      {
        label: 'Report Issue',
        click: async () =>
          await shell.openExternal(
            'https://github.com/theahmadzai/image-panda/issues'
          ),
      },
      {
        label: 'Suggest Feature',
        click: async () =>
          await shell.openExternal(
            'https://github.com/theahmadzai/image-panda/issues'
          ),
      },
      { type: 'separator' },
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'Check for updates',
        type: 'checkbox',
        checked: storage.get('checkForUpdates', true),
        click: e => {
          updater(e.checked)
          storage.set('checkForUpdates', e.checked)
        },
      },
    ],
  },
]

if (isDev) {
  menu.push({
    label: 'Developer',
    submenu: [{ role: 'reload' }, { role: 'toggledevtools' }],
  })
}

module.exports = menu
