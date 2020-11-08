const http = require('http')
const fs = require('fs')
const archiver = require('archiver')
const child_process = require('child_process')
const querystring = require('querystring')

// 1. 打开 https://github.com/login/oauth/authorize
child_process.exec('start https://github.com/login/oauth/authorize?client_id=Iv1.a272b6a8f00c656d')

http.createServer((req, res) => {
  if (req.url.indexOf('?') > -1) {
    const query = querystring.parse(req.url.match(/\?([\s\S]+)$/)[1])
    publish(query.token, (data) => {
      res.end(data)
      process.exit(1)
    })
  } else {
    res.end()
  }
}).listen(8083)

function publish(token, callback) {
  let request = http.request({
    host: '127.0.0.1',
    port: 8082,
    path: `/publish?token=${token}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  }, (res) => {
    let body = ''
    res.on('data', (chunk) => {
      body += chunk.toString()
    })
    res.on('end', () => {
      callback(body)
    })
  })
  
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })
  
  archive.directory('./example/', false)
  
  archive.pipe(request)
  
  archive.finalize()
}
