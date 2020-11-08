const http = require('http')
const https = require('https')
const fs = require('fs')
const unzipper = require('unzipper')
const querystring = require('querystring')

const client_id = 'Iv1.a272b6a8f00c656d'
const client_secret = '4a1fec1099925d9c1d9388672bc850fefe26f697'


// 2. auth路由: 接受code，用 code+client_id+client_secret 换 token
function auth(req, res) {
  const query = querystring.parse(req.url.match(/^\/auth\?([\s\S]+)$/)[1])
  getToken(query.code, (data) => {
    res.write(`<a href='http://localhost:8083?token=${data.access_token}'>publish</a>`)
    res.end()
  })
}

function getToken(code, callback) {
  https.request({
    hostname: 'github.com',
    path: `/login/oauth/access_token?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
    port: 443,
    method: 'POST'
  }, (res) => {
    let body = ''
    res.on('data', (chunk) => {
      body += chunk.toString()
    })
    res.on('end', () => {
      callback(querystring.parse(body))
    })
  }).end()
}

// 3. publish路由: 用token换取用户信息，检查权限，接受发布
function publish(req, res) {
  const query = querystring.parse(req.url.match(/^\/publish\?([\s\S]+)$/)[1])
  getUser(query.token, (data) => {
    console.log(data)
    if (data && data.id === 44925896) {
      req.pipe(unzipper.Extract({ path: '../node-server/public/' }))
      req.on('end', () => {
        res.end('success')
      })
    } else {
      res.end('error')
    }
  })
}

function getUser(token, callback) {
  https.request({
    hostname: 'api.github.com',
    path: '/user',
    port: 443,
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'toy-publish1'
    }
  }, (res) => {
    let body = ''
    res.on('data', (chunk) => {
      body += chunk.toString()
    })
    res.on('end', () => {
      callback(JSON.parse(body))
    })
  }).end()
}

http.createServer((req, res) => {

  if (req.url.match(/^\/auth/)) {
    return auth(req, res)
  } else if (req.url.match(/^\/publish/)) {
    return publish(req, res)
  }

  res.end('ok')
}).listen(8082)