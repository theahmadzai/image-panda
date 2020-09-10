const menu = [
  { role: 'reload' },
  { role: 'toggledevtools' }
]

if (process.platform === 'darwin') {
  menu.unshift({
    label: 'ApplicationName'
  })
}

module.exports = menu
