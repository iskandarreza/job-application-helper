const WebSocket = require('ws')
const setupTasks = require('./tasker')

const setupWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server })

  wss.on('connection', function connection(ws) {
    console.log('WebSocket connected')

    // Listen for messages from the client
    setupTasks(ws)

    // Listen for the WebSocket connection to close
    ws.on('close', function close() {
      console.log('WebSocket disconnected')
    })
  })

  return wss
}

module.exports = setupWebSocketServer
