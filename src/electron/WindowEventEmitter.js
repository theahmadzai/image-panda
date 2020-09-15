const EventEmitter = require('events')
const { Notification } = require('electron')
const { ICON_PATH } = require('../constants')
const filesize = require('filesize')

class WindowEventEmitter extends EventEmitter {
  forwardEventsToWindow (events, win) {
    Array.prototype.forEach.call(events, status => {
      this.on(status, msg => {
        win.webContents.send(status, msg)
      })
    })
  }

  notify ({ imagesCompressed, bytesSaved, timeTaken = new Date(0) }) {
    const time = (timeTaken.getMinutes() > 0) ? `${timeTaken.getMinutes()}m ${timeTaken.getSeconds()}s`
      : (timeTaken.getSeconds() > 0) ? `${timeTaken.getSeconds()} seconds`
        : `${timeTaken.getMilliseconds()}ms`

    new Notification({
      title: `${imagesCompressed} images compressed`,
      body: `${filesize(bytesSaved)} size saved in ${time}`,
      icon: ICON_PATH
    }).show()
  }
}

module.exports = WindowEventEmitter
