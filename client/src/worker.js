const websocketURI = process.env.REACT_APP_WEBSOCKET_URI
let wSocket
let messageClient
let clientMessageQueue = []

const taskReducer = async (task) => {
  const { data, client } = task
  const { action, data: payload } = data

  console.log('worker taskReducer: ', { action, payload })
  switch (action) {
    case 'UPDATE_LINK_DATA':
      sendWS(JSON.stringify({
        message: 'Refresh single record',
        data: payload
      }))
      break
    case 'GENERATE_SUMMARY':
      sendWS(JSON.stringify({
        message: 'Generate summary',
        data: payload
      }))
      break
    case 'GENERATE_SUMMARY_FROM_QUERY':
      sendWS(JSON.stringify({
        message: 'Send queried records to chatgpt prompt',
        data: payload
      }))
      break
    case 'CHECK_FOR_NEW_RECORDS_BEGIN':
      sendWS(JSON.stringify({
        message: 'Check for new records'
      }))
      break
    case 'CHECK_APPLIED':
      sendWS(JSON.stringify({
        message: 'Check applied postings status'
      }))
      break
    case 'CHECK_OLDEST_24':
      sendWS(JSON.stringify({
        message: 'Check oldest 24 open records'
      }))
      break

    default:
      break
  }
}

const processQueue = async () => {
  // If queue is not empty, process the next task
  if (clientMessageQueue.length > 0) {
    let task = clientMessageQueue.shift()
    let { client } = task

    let dispatchMsg = JSON.stringify({ message: 'Task added to queue for processing', task })
    client.postMessage(dispatchMsg)

    await taskReducer(task)

    // Process task
    processQueue()
  }
}

const initWebWorker = async () => {
  const ws = reconnectWS()

  ws.onopen = function (event) {
    console.log('WebSocket connection established')
  }

  self.addEventListener('message', messageListener)

}

const messageListener = (event) => {

  return (() => {
    if (event.origin === websocketURI) {
      const { receiver, message } = JSON.parse(event.data)
      const { action, data } = message

      if (receiver === 'webworker') {
        console.log('Service worker received websocket message: ', { message })

        
        if (action === 'GENERATING_SUMMARY') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'SUMMARY_RECORD_INSERTED') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'RECORD_REFRESH_SUCCESS') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'JOB_REFRESHED') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'FETCH_NEW_RECORDS_BEGIN') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'FETCH_NEW_RECORDS_REPORT') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'NEW_JOB_RECORD_ADDED') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'NEW_JOB_RECORD_NOT_ADDED') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'CHECK_APPLIED_COMPLETE') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        const newRecordsChecked = [
          'NO_NEW_RECORDS',
          'FETCH_NEW_RECORDS_SUCCESS'
        ]

        if (newRecordsChecked.includes(action)) {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        const applicationsChecked = [
          'CHECK_APPLIED_COMPLETE',
          'CHECK_APPLIED_INCOMPLETE',
        ]

        if (applicationsChecked.includes(action)) {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'UPDATE_24_OLDEST_REPORT') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

        if (action === 'UPDATE_24_OLDEST_SUCCESS') {
          sendPostMessage({ action, payload: data }, messageClient)
        }

      }

    } else {
      const { source: client, data } = event
      messageClient = client

      console.log('Service worker received postMessage: ', { data, client })

      if (data.action === 'SERVICE_WORKER_REGISTERED') {
        sendWS(JSON.stringify({ message: 'Service worker registered' }))
      } else {
        try {
          clientMessageQueue.push({ data, client })
          processQueue()
        } catch (error) {
          console.log(error)
        }
      }
    }

  })()
}

// WebSocket init
const initWebSocket = () => {
  const socket = new WebSocket(websocketURI)

  socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened!')
    wSocket = socket

    sendWS(null)
  })

  socket.addEventListener('message', messageListener)

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event)
    if (wSocket) {
      wSocket.removeEventListener('message', messageListener)
      wSocket.close()
      wSocket = null;
    }
  })

  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed', event)
    if (wSocket) {
      wSocket.removeEventListener('message', messageListener)
      wSocket.close()
      wSocket = null;
    }
    reconnectWS()
  })

  return socket
}

const reconnectWS = async () => {
  console.log('Attempting to reconnect to WebSocket server in 5 seconds...')
  setTimeout(async () => {
    initWebSocket()
  }, 5000)
}

let wsMessageQueue = []
async function sendWS (data) {
  const reduceMessageQueue = () => {
    wsMessageQueue.length > 0 && wsMessageQueue.reduce((acc, curr) => {
      console.log({wsMessageQueue})
  
      setTimeout(() => {
        console.log({wsMessageQueue})
        const {timestamp, data} = curr
        console.log({timestamp, data})  
        wsMessageQueue.shift()
        data !== null && wSocket.send(data)
  
      }, (10 * 1000))
    })
  }

  if (data === null && wSocket.readyState === 1 && wsMessageQueue.length > 0) {
    reduceMessageQueue()
  }
  
  else if (wSocket !== null && typeof wSocket !== 'undefined') {

    try {

      if (wSocket.readyState === 1) {
        if (wsMessageQueue.length > 0) {
          
          reduceMessageQueue()
  
        } else {
          data !== null && wSocket.send(data)
        }

      } else {
        data !== null && wsMessageQueue.push({timestamp: new Date().toISOString(), data}) 
      }


    } catch (error) {
      console.log('sendWS error. Storing message in queue.', { error, data })
      data !== null && wsMessageQueue.push({timestamp: new Date().toISOString(), data})
    }
  } else {
    console.log('WebSocket connection currently unavailable. Retrying...')
    data !== null && sendWS(data)
  }
 
}

const sendPostMessage = (payload) => {
  try {
    messageClient.postMessage(payload)
  } catch (error) {
    console.error({ error, payload })
    if (messageClient) {
      console.debug({ messageClient, payload })
      setTimeout(() => {
        messageClient.postMessage(payload)
      }, 5000)
    }
  }
}

initWebWorker()