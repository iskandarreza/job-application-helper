(function () {
  'use strict';

  const serviceWorker = () => {
    const websocketURI = "ws://localhost:5001";
    const self = undefined;
    let wSocket;
    let messageClient;
    let clientMessageQueue = [];
    
    const taskReducer = async (task) => {
      const { data, client } = task;
      const { action, data: payload } = data;
    
      console.log('taskReducer: ', { action, payload });
      switch (action) {
        case 'UPDATE_LINK_DATA':
          sendWS(JSON.stringify({
            message: 'Refresh single record',
            data: payload
          }));
          break
        case 'GENERATE_SUMMARY':
          sendWS(JSON.stringify({
            message: 'Generate summary',
            data: payload
          }));
          break
        case 'GENERATE_SUMMARY_FROM_QUERY':
          sendWS(JSON.stringify({
            message: 'Send queried records to chatgpt prompt',
            data: payload
          }));
          break
        case 'CHECK_FOR_NEW_RECORDS_BEGIN':
          sendWS(JSON.stringify({
            message: 'Check for new records'
          }));
          break
        case 'CHECK_APPLIED':
          sendWS(JSON.stringify({
            message: 'Check applied postings status'
          }));
          break
        case 'CHECK_OLDEST_24':
          sendWS(JSON.stringify({
            message: 'Check oldest 24 open records'
          }));
          break
      }
    };
    
    const processQueue = async () => {
      // If queue is not empty, process the next task
      if (clientMessageQueue.length > 0) {
        let task = clientMessageQueue.shift();
        let { client } = task;
    
        let dispatchMsg = JSON.stringify({ message: 'Task added to queue for processing', task });
        client.postMessage(dispatchMsg);
        sendWS(dispatchMsg);
    
        await taskReducer(task);
    
        // Process task
        processQueue();
      }
    };
    
    const initWebWorker = async () => {
      const ws = reconnectWS();
    
      ws.onopen = function (event) {
        console.log('WebSocket connection established');
      };
    
      self.addEventListener('message', messageListener);
    
    };
    
    const messageListener = (event) => {
    
      return (() => {
        if (event.origin === websocketURI) {
          const { receiver, message } = JSON.parse(event.data);
          const { action, data } = message;
    
          if (receiver === 'webworker') {
            console.log('Service worker received websocket message: ', {message});
    
            if (action === 'SUMMARY_RECORD_INSERTED') {
              sendPostMessage({ action, payload: data });
            }
    
            if (action === 'RECORD_REFRESH_SUCCESS') {
              sendPostMessage({ action, payload: data });
            }
    
            const newRecordsChecked = [
              'NO_NEW_RECORDS',
              'FETCH_NEW_RECORDS_SUCCESS'
            ];
    
            if (newRecordsChecked.includes(action)) {
              sendPostMessage({ action, payload: data });
            }
    
            const applicationsChecked = [
              'CHECK_APPLIED_COMPLETE',
              'CHECK_APPLIED_INCOMPLETE',
            ];
    
            if (applicationsChecked.includes(action)) {
              sendPostMessage({ action, payload: data });
            }
      
          }      
    
        } else {
          const { source: client, data } = event; 
          messageClient = client;
    
          console.log('Service worker received postMessage: ', { data, client });
    
          if (data.action === 'SERVICE_WORKER_REGISTERED') {
            sendWS(JSON.stringify({ message: 'Service worker registered' }));
          } else {
            try {
              clientMessageQueue.push({ data, client });
              processQueue();
            } catch (error) {
              console.log(error);
            }
          }
        }
    
      })()
    };
    
    // WebSocket init
    const initWebSocket = () => {
      const socket = new WebSocket(websocketURI);
    
      socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened!');
        wSocket = socket;
      });
    
      socket.addEventListener('message', messageListener);
    
      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
        if (wSocket) {
          wSocket.removeEventListener('message', messageListener);
          wSocket.close();
          wSocket = null;
        }
      });
    
      socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed', event);
        if (wSocket) {
          wSocket.removeEventListener('message', messageListener);
          wSocket.close();
          wSocket = null;
        }
        reconnectWS();
      });
    
      return socket
    };
    
    const reconnectWS = async () => {
      console.log('Attempting to reconnect to WebSocket server in 5 seconds...');
      setTimeout(async () => {
        initWebSocket();
      }, 5000);
    };
    
    const sendWS = async (data) => {
      try {
        wSocket.send(data);
      } catch (error) {
        // console.error('sendWS error', { error, data })
        if (wSocket) {
          // this doesn't happen, but the data is received anyway.. ?
          console.debug('resending data...', data);
          setTimeout(function () {
            sendWS(data);
          }, 5000);
        }
      }
    };
    
    const sendPostMessage = (payload) => {
      try {
        messageClient.postMessage(payload);
      } catch (error) {
        console.error({ error, payload });
        if (messageClient) {
          console.debug({ messageClient, payload });
          setTimeout(() => {
            messageClient.postMessage(payload);
          }, 5000);
        }
      }
    };
    
    initWebWorker();
    
  };

  return serviceWorker;

})();
