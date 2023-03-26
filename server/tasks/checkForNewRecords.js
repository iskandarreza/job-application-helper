const axios = require("axios")
const sendMessage = require("../websocket/sendMessage")

/**
 * It checks for new records, if there are new records, it sends a message to the client, then it
 * fetches the content of the new records, then it sends another message to the client.
 * @param ws - the websocket connection
 */
const checkForNewRecords = async (ws) => {
  try {
    let newData
    
    const hasNewRecords = await axios
      .get('http://localhost:5000/record/new')
      .then(({ data }) => {
        newData = data
        return data.length > 0
      })
  
    if (hasNewRecords){
      const recordNoun = newData.length > 1 ? 'records' :
        newData.length === 0 ? recordNoun = 'no' : 'record'
      const message1 = `${newData.length} new ${recordNoun} queued`
      const message2 = `Content will be fetched in the background`
      const message3 = 'New content has been fetched'
      const crawlNewRecords = require("./tasks/crawlNewRecords")
  
      sendMessage(ws, message1)
      sendMessage(ws, message2)
  
      await crawlNewRecords(ws, newData)
      sendMessage(ws, message3)
    } else {
      sendMessage(ws, 'No new records since last connection')
    }
  } catch (error) {
    console.log(error)
  }
  
}

module.exports = checkForNewRecords