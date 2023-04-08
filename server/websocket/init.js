const WebSocket = require('ws')

const setupWebSocketServer = (server) => {
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

  return wss
}

module.exports = setupWebSocketServer
