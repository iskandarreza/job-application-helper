const axios = require("axios")

const checkForNewRecords = require("../tasks/checkForNewRecords")
const sendMessage = require("./sendMessage")
const checkAppiedStatus = require("../tasks/checkAppliedStatus")
const fetchPagesData = require("../tasks/fetchPagesData")
const meta = require("../meta")

const sendQueriedRecordsToPrompt = require("../tasks/sendQueriedRecordsToPrompt")
const initPromptSetup = require("../chatgpt/initPromptSetup")
const formatMessage = require("./formatMessage")
const checkOlderRecords = require("../tasks/checkOlderRecords")

let spawnCount = 0
const setupTasks = (ws) => {

  const startupCheck = true
  const checkNew = true
  const checkApplied = true
  const checkOld = true


  ws.on('message', async (data) => {
    const { message } = JSON.parse(data)

    if (startupCheck) {
      console.log('Websocket received message: ', message)

      if (message === 'Check for new records' && checkNew) {
        await checkForNewRecords(ws)
      }

      if (message === 'Check applied postings status' && checkApplied) {
        await checkAppiedStatus(ws)
      }

      if (message === 'Check oldest 24 open records' && checkOld) {
        await checkOlderRecords(ws)
      }

    }

    if (message === 'Generate summary') {
      let { data: record } = JSON.parse(data)
      const action = 'GENERATING_SUMMARY'
      const send = formatMessage(action, 'Summary request sent to ChatGPT', record.id)
      sendMessage(ws, send)
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

  console.log('Websocket task listener has been set up')

  ws.on('spawn', () => {
    spawnCount++
    console.log(`New Websocket instance spawned. Spawn count: ${spawnCount}`)

  })

  ws.on('exit', () => {
    console.log(`ws ${spawnCount}`)
  })

}

module.exports = setupTasks