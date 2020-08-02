const net = require('net')

module.exports = class Request {
  
  constructor(options) {
    this.method = options.method || 'GET'
    this.host = options.host
    this.path = options.path || '/'
    this.port = options.port || 80
    this.body = options.body || {}
    this.headers = options.headers || {}

    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
    }
    this.headers['Content-Length'] = this.bodyText.length
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser()
      console.log(this.toString())
      if (connection) {
        connection.write(this.toString())
      } else {
        connection = net.createConnection({ 
          port: this.port, 
          host: this.host
        }, () => {
          connection.write(this.toString())
        })
      }
      connection.on('data', (data) => {
        console.log(data.toString())
        parser.receive(data.toString())
        if (parser.isFinished) {
          resolve(parser.response)
          connection.end()
        }
      })
      connection.on('error', (err) => {
        reject(err)
        connection.end()
      })
    })
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r${this.bodyText}\r\n`
  }
}


class ResponseParser {

  constructor() {

    const waitingStatusLine = (s) => {
      if (s === '\r') {
        return waitingStatusLineEnd
      }
      this.statusLine += s
      return waitingStatusLine
    }
    const waitingStatusLineEnd = (s) => {
      if (s === '\n') {
        return waitingHeaderName
      }
      return waitingStatusLineEnd
    }
    const waitingHeaderName = (s) => {
      if (s === ':') {
        return waitingHeaderSpace
      } else if (s === '\r') {
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new TrunkedBodyParser()
        }
        return waitingHeaderBlockEnd
      }
      this.headerName += s
      return waitingHeaderName
    }
    const waitingHeaderSpace = (s) => {
      if (s === ' ') {
        return waitingHeaderValue
      }
      return waitingHeaderSpace
    }
    const waitingHeaderValue = (s) => {
      if (s === '\r') {
        this.headers[this.headerName] = this.headerValue
        this.headerName = ''
        this.headerValue = ''
        return waitingHeaderLineEnd
      }
      this.headerValue += s
      return waitingHeaderValue
    }
    const waitingHeaderLineEnd = (s) => {
      if (s === '\n') {
        return waitingHeaderName
      }
      return waitingHeaderLineEnd
    }
    const waitingHeaderBlockEnd = (s) => {
      if (s === '\n') {
        return waitingBody
      }
      return waitingHeaderBlockEnd
    }
    const waitingBody = (s) => {
      if (this.bodyParser) {
        this.bodyParser.receiveChar(s)
      }
      return waitingBody
    }

    this.state = waitingStatusLine
    this.statusLine = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    this.bodyParser = null
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      status: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    }
  }

  receive(str) {
    for (let i = 0; i < str.length; i++) {
      this.receiveChar(str.charAt(i))
    }
  }
  receiveChar(char) {
    this.state = this.state(char)
  }
}


class TrunkedBodyParser {

  constructor() {
    const waitingLength = (s) => {
      if (s === '\r') {
        if (this.length === 0) {
          this.isFinished = true
        }
        return waitingLengthLineEnd
      }
      this.length *= 16
      this.length += parseInt(s, 16)
      return waitingLength
    }
    const waitingLengthLineEnd = (s) => {
      if (s === '\n') {
        return readingTrunk
      }
      return waitingLengthLineEnd
    }
    const readingTrunk = (s) => {
      if (this.length === 0) {
        return waitingNewLine
      }
      this.length--
      this.content.push(s)
      return readingTrunk
    }
    const waitingNewLine = (s) => {
      if (s === '\r') {
        return waitingNewLineEnd
      }
      return waitingNewLine
    }
    const waitingNewLineEnd = (s) => {
      if (s === '\n') {
        return waitingLength
      }
      return waitingNewLineEnd
    }

    this.length = 0
    this.content = []
    this.isFinished = false
    this.state = waitingLength
  }

  receiveChar(char) {
    this.state = this.state(char)
  }
}