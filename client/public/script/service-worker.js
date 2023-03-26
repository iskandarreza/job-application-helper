

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

const updateLinkData = async (_id, payload) => {

  return fetch(`http://localhost:5000/update/${_id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: 'POST',
    body: JSON.stringify(payload)
  }).then((response) => response.json())
    .then((data) => { return data })
    .catch((error) => { console.log(error) })
}

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
        const updateRecord1 = fetch(`http://localhost:5000/record/linkdata/${id}`, {
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
}

const taskReducer = async (task) => {
  const { data, client } = task
  const { action, data: payload } = data

  switch (action) {
    case 'UPDATE_LINK_DATA':
      return updateLinkDataAction(client, payload)

    default:
      break;
  }
}

let taskQueue = []
const processQueue = async () => {
  // If queue is not empty, process the next task
  if (taskQueue.length > 0) {
    let task = taskQueue.shift()
    const { client } = task
    const response = await taskReducer(task)
    console.log({ response })

    // Process task
    client.postMessage({ data: response, action: 'UPDATE_LINK_DATA_COMPLETE' })
    processQueue()
  }
}

const self = this;
let wSocket;

const initWebWorker = async () => {
  const ws = initWebSocket();

  ws.onopen = function (event) {
    console.log('WebSocket connection established');
    ws.send(JSON.stringify({message: 'Hello, server!'}));

  }
  
  self.addEventListener('message', (event) => {
    const { data, source: client } = event;
    taskQueue.push({ data, client });
    processQueue();
    wSocket.send(JSON.stringify({ message: 'Task added to queue for processing', data }));
  })

}

// WebSocket init
const initWebSocket = () => {
  const socket = new WebSocket('ws://localhost:5001');

  socket.addEventListener('open', (event) => {
    console.log('WebSocket connection opened!');
    wSocket = socket
    isSocketReady = true
  });

  socket.addEventListener('message', (event) => {
    console.log('WebSocket WebWorker received message:', event?.data);
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed');
    wSocket = null;
    isSocketReady = false;
  });

  return socket;
};

initWebWorker();