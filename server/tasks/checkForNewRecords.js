require("dotenv").config({ path: "./config.env" })
const axios = require("axios")
const meta = require("../meta")
const sendMessage = require("../websocket/sendMessage")
const fetchPagesData = require("./fetchPagesData")
const chunkObjects = require("./chunkObjects")

/**
 * The function checks for new records by making a POST request to a server endpoint, fetching the
 * content of new records in the background, and sending messages to the client indicating the status
 * of the fetch.
 * @param ws - The `ws` parameter is likely a WebSocket object that represents the connection between
 * the client and the server. It is used to send messages to the client.
 */
const checkForNewRecords = async (ws) => {
  try {
    let newData = []
    
    /* This code is making a POST request to a server endpoint `/records/email-link-data/` with a query
    parameter `new=true`. It then waits for the response using `await` and extracts the `data`
    property from the response using destructuring. It then passes the `data` to a function called
    `meta` which returns an array of objects with specific properties. The code then checks if the
    length of the `data` array is greater than 0 and returns a boolean value. The boolean value is
    stored in the `hasNewRecords` constant. */
    const hasNewRecords = await axios
      .post(`${process.env.SERVER_URI}/records/email-link-data/?new=true`)
      .then(({ data }) => {
        newData = [...meta(data)]
        return data.length > 0
      })
  
    /* This code block is checking if there are new records by sending a POST request to a server
    endpoint and extracting the data property from the response. If there are new records, it sends
    a message to the client indicating the number of new records queued and begins fetching the
    content of the new records in the background. It chunks the new records into smaller arrays and
    uses `fetchPagesData` function to fetch the content of each record. It then sends a message to
    the client indicating whether the fetch was successful or not. If there are no new records, it
    sends a message to the client indicating that there are no new records since the last
    connection. */
    if (hasNewRecords){
      let recordNoun = newData.length > 1 ? 'records' :
        newData.length === 0 ? recordNoun = 'no' : 'record'
      const message1 = `${newData.length} new ${recordNoun} queued`
      const message2 = {action: 'FETCH_NEW_RECORDS_BEGIN', data: {
        message: 'Content will be fetched in the background',
        data: newData
      }}
      const chunks = chunkObjects(newData, 1)

      sendMessage(ws, message1)
      sendMessage(ws, message2)

      for (const chunk of chunks ) {
        const promises = chunk.map(async (record) => {
          const result = await fetchPagesData([record], ws, false)
          const action = !result.response.data.error ? 'FETCH_NEW_RECORDS_SUCCESS' : 'FETCH_NEW_RECORDS_ERROR'
          const message = !result.response.data.error ? `${result.upserted} new records fetched` : 'Failed to fetch page data'
          const error = result.response.data.error
          const message3 = {
            action, 
            data: {
              message, 
              ...(!!result.response.data.error && {error})
            },
          }
          sendMessage(ws, message3)
        })

        await Promise.all(promises)
      }

    } else {
      sendMessage(ws, {action: 'NO_NEW_RECORDS', data: 'No new records since last connection'})
    }
  } catch (error) {
    console.log(error)
  }
  
}

module.exports = checkForNewRecords