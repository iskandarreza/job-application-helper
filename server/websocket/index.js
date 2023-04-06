const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const app = express()
const server = http.createServer(app)

const setupWebSocketServer = () => {
  const wss = new WebSocket.Server({ server })

  wss.on('connection', function connection(ws) {
    console.log('WebSocket connected')

    // Listen for messages from the client
    ws.on('message', function incoming(message) {
      console.log('WebSocket server received message:',JSON.parse(message.toString()))
    })

    // Listen for the WebSocket connection to close
    ws.on('close', function close() {
      console.log('WebSocket disconnected')
    })
  })

  // Start the server
  server.listen(5001, function listening() {
    console.log('WebSocket server listening on port', server.address().port)
  })

  return wss
}

module.exports = setupWebSocketServer
