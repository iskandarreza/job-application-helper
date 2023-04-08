const axios = require("axios")

const checkForNewRecords = require("../tasks/checkForNewRecords")
const sendMessage = require("./sendMessage")
const checkAppiedStatus = require("../tasks/checkAppliedStatus")
const fetchPagesData = require("../tasks/fetchPagesData")
const meta = require("../meta")

const sendQueriedRecordsToPrompt = require("../tasks/sendQueriedRecordsToPrompt")
const initPromptSetup = require("../chatgpt/initPromptSetup")

const setupTasks = (ws) => {

    let lastFetch
  
    ws.on('message', async (data) => {
      const { message } = JSON.parse(data)
      const startupCheck = true
      const checkNew = true
      const checkApplied = true
      const checkOld = true
  
      if (startupCheck) {
  
        if (message === 'Check for new records' && checkNew) {
          await checkForNewRecords(ws)
          lastFetch = new Date().toISOString()
        }
  
        if (message === 'Check applied postings status' && checkApplied) {
          await checkAppiedStatus(ws)
        }
  
        if (message === 'Check oldest 24 open records' && checkOld) {
          const { default: axios } = require("axios")
          const query = {
            positionStatus: 'open'
          }
  
          const records = await axios.post(`${process.env.SERVER_URI}/records/email-link-data/`, query)
            .then((response) => {
              console.log(`${response.data.length} open records in total`)
              return response.data
            })
            .catch((error) => console.error(error))
  
          let result = await fetchPagesData(meta(records.slice(0, 24)), ws, true)
          let payload = {
            action: 'UPDATE_24_OLDEST_SUCCESS',
            data: {
              message: `${result} records refreshed`,
              timestamp: new Date().toISOString()
            }
          }
          sendMessage(ws, payload)
        }
  
      }
  
      if (message === 'Generate summary') {
        let { data: record } = JSON.parse(data)
        await initPromptSetup(record, ws)
      }
  
      if (message === 'Refresh single record') {
        let { data: record } = JSON.parse(data)
        await fetchPagesData(meta([record]), ws, false)
  
        let payload = {
          action: 'RECORD_REFRESH_SUCCESS',
          data: {
            record: await axios
              .get(`${process.env.SERVER_URI}/record/${record._id}`)
              .then((response) => response.data)
          }
        }
  
        sendMessage(ws, payload)
      }
  
      if (message === 'Send queried records to chatgpt prompt') {
        await sendQueriedRecordsToPrompt(ws, query)
      }
    })
  
    if (!lastFetch) {
      const data = { lastFetch: false }
      const payload = { action: 'LAST_FETCH_FALSE', data }
      sendMessage(ws, payload)
  
  
    }
}

module.exports = setupTasks