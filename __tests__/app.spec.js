const path = require('path')
const Application = require('spectron').Application
const electronPath = require('electron')

let app

beforeAll(() => {
  app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '../')],
  })

  return app.start()
}, 15000)

afterAll(() => {
  if (app && app.isRunning()) {
    return app.stop()
  }
})

test('Displays App window', async () => {
  let windowCount = await app.client.getWindowCount()

  expect(windowCount).toBe(1)
})
