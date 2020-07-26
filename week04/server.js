const http = require('http')

const server = http.createServer((req, res) => {
  console.log(req.method)
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(`
    <html>
      <head></head>
      <body></body>
    </html>
  `)
})

server.listen(8088, () => {
  console.log('server started')
})