const EventEmitter = require('events')

class WindowEventEmitter extends EventEmitter {
  forwardEventsToWindow (events, win) {
    Array.prototype.forEach.call(events, status => {
      this.on(status, msg => {
        win.webContents.send(status, msg)
      })
    })
  }
}

module.exports = WindowEventEmitter
