const http = require('http')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(`
    <html>
      <head>
        <style>
          #container {
            width: 500px;
            height: 300px;
            display: flex;
            flexDirection: column;
            background-color: rgb(0, 0, 0);
          }
          #container .child {
            width: 100px;
            height: 100px;
          }
          #container .bg1 {
            background-color: rgb(255, 0, 0);
          }
          #container .bg2 {
            background-color: rgb(0, 255, 0);
          }
        </style>
      </head>
      <body>
          <div id="container">
            <div class="child bg1"></div>
            <div class="child bg2"></div>
          </div>
      </body>
    </html>
  `)
})

server.listen(8088, () => {
  console.log('server started')
})