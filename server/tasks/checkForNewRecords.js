const axios = require("axios")
const meta = require("../meta")
const sendMessage = require("../websocket/sendMessage")

/**
 * It checks for new records, if there are new records, it sends a message to the client, then it
 * fetches the content of the new records, then it sends another message to the client.
 * @param ws - the websocket connection
 */
const checkForNewRecords = async (ws) => {
  try {
    let newData = []
    
    const hasNewRecords = await axios
      .post('http://localhost:5000/records/email-link-data/?new=true')
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
      const fetchPagesData = require("./fetchPagesData")

      sendMessage(ws, message1)
      sendMessage(ws, message2)

      let result = await fetchPagesData(newData, ws)
      const message3 = {action: 'FETCH_NEW_RECORDS_SUCCESS', data: `${result} new records fetched`}
      sendMessage(ws, message3)
    } else {
      sendMessage(ws, {action: 'NO_NEW_RECORDS', data: 'No new records since last connection'})
    }
  } catch (error) {
    console.log(error)
  }
  
}

module.exports = checkForNewRecords