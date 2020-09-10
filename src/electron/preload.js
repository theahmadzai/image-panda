const fs = require('fs')
const path = require('path')

fs.readFile(path.resolve(__dirname, '../../.key'), (err, data) => {
  if (!err) {
    window.TINY_API_KEY = data.toString().trim()
  }
})
