require("dotenv").config({ path: "./config.env" })
const axios = require("axios")
const meta = require("../meta")
const sendMessage = require("../websocket/sendMessage")
const fetchPagesData = require("./fetchPagesData")
const chunkObjects = require("./chunkObjects")


/**
 * It checks for new records, if there are new records, it sends a message to the client, then it
 * fetches the content of the new records, then it sends another message to the client.
 * @param ws - the websocket connection
 */
const checkForNewRecords = async (ws) => {
  try {
    let newData = []
    
    const hasNewRecords = await axios
      .post(`${process.env.SERVER_URI}/records/email-link-data/?new=true`)
      .then(({ data }) => {
        newData = [...meta(data)]
        return data.length > 0
      })
  
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
          const message3 = {
            action: !result.response.data.error ? 'FETCH_NEW_RECORDS_SUCCESS' : 'FETCH_NEW_RECORDS_ERROR', 
            data: {
              message: !result.response.data.error ? `${result.upserted} new records fetched` : 'Failed to fetch page data'
              (result.response.data.error && {error: result.response.data.error})
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