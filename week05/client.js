const images = require('images')
const Request = require('./request')
const parser = require('./parser')
const render = require('./render')

const request = new Request({
  method: 'GET',
  host: 'localhost',
  port: 8088
});

(async () => {
  const res = await request.send()
  const dom = parser(res.body)
  const viewport = images(800, 600)
  render(viewport, dom)
  viewport.save('viewport.jpg')
})()
