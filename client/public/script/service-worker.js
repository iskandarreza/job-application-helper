const self = this;
let wSocket;
let taskQueue = []

/**
 * It takes a row from a table, and returns the status of a job posting.
 * @param row - { id: '12345', url: 'https://www.indeed.com/viewjob?jk=12345' }
 * @returns An array of promises.
 */
const checkJobStatus = async (row) => {
  const { id, url } = row
  let hostname
  if (url.includes('indeed')) {
    hostname = 'indeed'
  } else if (url.includes('linkedin')) {
    hostname = 'linkedin'
  }

  return fetch(`http://localhost:5000/job-status/${hostname}/${id}`)
    .then((response) => response.json())
    .then((data) => { return data })
    .catch((error) => { console.error(error) })
}

/**
 * It takes an _id and a payload, and then it makes a PUT request to the server with the _id and
 * payload.
 * @param _id - the id of the record to be updated
 * @param payload - { crawlDate, positionStatus, org?, role?, location?, externalSource }
 * @returns The data from the database.
 */
const updateLinkData = async (_id, payload) => {

  return fetch(`http://localhost:5000/record/${_id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: 'PUT',
    body: JSON.stringify(payload)
  }).then((response) => response.json())
    .then((data) => { return data })
    .catch((error) => { console.log(error) })
}

/**
 * It checks the status of a job posting, and if the job is still open, it updates the
 * link-content-data collection with the new data, and then updates the main collection with the new
 * data.
 * @param client - the worker client
 * @param payload - { id, url }
 */
const updateLinkDataAction = async (client, payload) => {
  const { _id, id } = payload
  const promise1 = checkJobStatus(payload)
    .then((data) => {

      if (data.status !== 'closed') {
        // data to be inserted into main collection
        const payload = {
          crawlDate: new Date().toISOString(),
          positionStatus: data.status,
          org: data.org,
          role: data.role,
          location: data.location,
          externalSource: data.externalSource
        }

        // Insert updated linkdata directly to link-content-data collection
        const updateRecord1 = fetch(`http://localhost:5000/record/${id}/linkdata`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: 'POST',
          body: JSON.stringify(data)
        }).then((response) => response.json())
          .then((data) => {
            client.postMessage({ action: 'UPDATE_LINK_DATA_SUCCESS', payload: data })
          })
          .catch((error) => { console.log(error) })

        const updateRecord2 = updateLinkData(_id, payload)
          .then((data) => {
            client.postMessage({ action: 'UPDATE_LINK_DATA_WIND_DOWN', payload: data })
          })
          .catch((error) => { console.log(error) })

        Promise.race([updateRecord1, updateRecord2])

      } else {
        // data to be inserted into main collection
        const payload = {
          crawlDate: new Date().toISOString(),
          positionStatus: data.status,
        }

        const updateRecord1 = client.postMessage({ action: 'UPDATE_LINK_DATA_SUCCESS', payload: data })
        const updateRecord2 = updateLinkData(_id, payload)
          .then((data) => {
            client.postMessage({ action: 'UPDATE_LINK_DATA_WIND_DOWN', payload: data })
          })
          .catch((error) => { console.log(error) })

        Promise.race([updateRecord1, updateRecord2])
      }
    })
    .catch((error) => { console.log(error) })

  const promise2 = client.postMessage({ action: 'UPDATE_LINK_DATA_BEGIN', payload: new Date().toISOString() })

  await Promise.race([promise1, promise2])
  client.postMessage({ action: 'UPDATE_LINK_DATA_COMPLETE' })
}

const taskReducer = async (task) => {
  const { data, client } = task
  const { action, data: payload } = data

  console.log('taskReducer: ', {action, payload})
  switch (action) {
    case 'UPDATE_LINK_DATA':
      return updateLinkDataAction(client, payload)
    default:
      break
  }
}

const processQueue = async () => {
  // If queue is not empty, process the next task
  if (taskQueue.length > 0) {
    let task = taskQueue.shift()

    console.log('processQueue: ', {task})
    wSocket.send(JSON.stringify({ message: 'Task added to queue for processing', task }));

    await taskReducer(task)

    // Process task
    processQueue()
  }
}

/**
 * It's a function that initializes a WebSocket connection and listens for messages from the client. 
 * 
 * When the client sends a message, the function pushes the message to a queue and calls a function to
 * process the queue. 
 * 
 * The function also listens for a message from the client that indicates the service worker has been
 * registered. When it receives this message, it sends a message to the server. 
 * 
 * The function is called in the service worker's install event listener.
 */
const initWebWorker = async () => {
  const ws = reconnectWS()

  ws.onopen = function (event) {
    console.log('WebSocket connection established')
    
    try {
      if (wSocket) {
        setTimeout(function () {
          wSocket.send(checkForNewRecords)
        }, 5 * 1000)
      } 
    } catch (error) {
      
    }
  }
  
  self.addEventListener('message', (event) => {
    /**
     * The function is called when the service worker receives a message from the client. The message
     * is then added to a queue and the queue is processed.
     */
    const { data, source: client } = event
    console.log('Service worker received postMessage: ', { data, client })

    if (data.action === 'SERVICE_WORKER_REGISTERED') {
      try {
        wSocket.send(checkForNewRecords)
      } catch (error) {
        console.error(error)
        if (wSocket) {
          setTimeout(function () {
            wSocket.send(checkForNewRecords)
          }, 5000)
        }
      }
    } else {
      try {
        taskQueue.push({ data, client })
        processQueue()
      } catch (error) {
        console.log(error)
      }
    }
  })

}

const checkForNewRecords = JSON.stringify({ message: 'Check for new records' })

const messageListener = (event) => {
  return (() => {
    const eventData = JSON.parse(event.data)
    const { receiver, message } = eventData
    const { action, data } = message

    if (receiver === 'webworker') {
      console.log('WebSocket WebWorker received message:', message)
    }

    if (action === 'LAST_FETCH_FALSE') {
      try {
        wSocket.send(checkForNewRecords)
      } catch (error) {
        console.error(error)
        if (wSocket) {
          setTimeout(function () {
            wSocket.send(checkForNewRecords)
          }, 5000)
        }
      }
    }
  })()
}

// WebSocket init
const initWebSocket =  () => {
  const socket = new WebSocket('ws://localhost:5001')

  socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened!')
    wSocket = socket
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

initWebWorker()