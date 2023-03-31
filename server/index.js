require("dotenv").config({ path: "./config.env" })
const setupWebSocketServer = require("./websocket")
const express = require("express")
const process = require('process')
const axios = require("axios")
const http = require('http')
const cors = require("cors")
const app = express()

// get MongoDB driver connection
const dbo = require("./db/conn")

const PORT = process.env.PORT || 5000

const wss = setupWebSocketServer()
const checkForNewRecords = require("./tasks/checkForNewRecords")
const sendMessage = require("./websocket/sendMessage")
const checkAppiedStatus = require("./tasks/checkAppliedStatus")
const fetchPagesData = require("./tasks/fetchPagesData")
const meta = require("./meta")

const generateSummary = require("./tasks/generateSummary")

wss.on('connection', async (ws) => {
  let lastFetch

  ws.on('message', async (data) => {
    const { message } = JSON.parse(data)
    const startupCheck = false
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

        const records = await axios.post('http://localhost:5000/records/email-link-data/', query)
          .then((response) => {
            console.log(`${response.data.length} open records in total`)
            return response.data
          })
          .catch((error) => console.error(error))

        let result = await fetchPagesData(meta(records.slice(0, 24)), ws)
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
      await generateSummary(ws, record)
    }

    if (message === 'Refresh single record') {
      let { data: record } = JSON.parse(data)
      await fetchPagesData(meta([record]), ws)

      let payload = {
        action: 'RECORD_REFRESH_SUCCESS',
        data: {
          record: await axios
            .get(`http://localhost:5000/record/${record._id}`)
            .then((response) => response.data)
        }
      }

      sendMessage(ws, payload)
    }
  })

  if (!lastFetch) {
    const data = { lastFetch: false }
    const payload = { action: 'LAST_FETCH_FALSE', data }
    sendMessage(ws, payload)

    const query = {
      "$and": [
        {
          "positionStatus": "open"
        },
        {
          "externalSource": "true"
        },
        {
          "status1": {
            "$ne": "applied"
          }
        },
        {
          "status1": {
            "$ne": "uncertain"
          }
        },
        {
          "status1": {
            "$ne": "declined"
          }
        }
      ]
    }

    let records = []
    await axios
      .post('http://localhost:5000/records/email-link-data/?field=dateModified&sort_order=dec', query)
      .then(({ data }) => {
        records = [...meta(data)]
        return data
      })

sendMessage(ws, {
  message: `${records.length} RECORDS MATCHED`,
  data: records
})

    for (const record of records) {
      const { id } = record
      let result
      await axios.post('http://localhost:5000/records/chatgpt-summary-responses/', { id })
        .then(async ({ data }) => {
          // check if record already exist, replace only if summary is malformed
          if (data.length >= 1) {
            try {
              result = JSON.parse(data[0].response.result)
              // sendMessage(ws, {
              //   message: 'SUMMARY_PARSE_SUCCESS',
              //   data: data,
              //   parsed: result 
              // })
            } catch (error) {
              let test = data[0].response.result

              try {
                if (test.hasOwnProperty('summary')) {
                  summary = data[0].response.result

                }
              } catch (error) {

                await axios
                .post('http://localhost:5000/logging/chatgpt-error-log', {
                  type: 'SUMMARY_PARSE_ERROR',
                  data: data,
                  parsed: result
                })
                .catch((error) => {
                  console.error(error)
                })

                sendMessage(ws, {
                  message: 'SUMMARY_PARSE_ERROR',
                  data: data,
                  parsed: result
                })
              }

            }

            if (result?.summary === '') {
              await initPromptSetup(record, ws)
            } else {
              
            }

          } else {
            await initPromptSetup(record, ws)

          } 
          
        })



      }
  }
})


// Middleware to handle incoming requests while server is restarting
let serverReady = false
app.use((req, res, next) => {
  if (!serverReady) {
    res.status(503).send('Server is temporarily unavailable for maintenance.')
  } else {
    next()
  }
})

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use("/uploads", express.static("uploads"))
app.use(express.json())
app.use(cors())

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(require("./routes/puppeteer"))

app.use(require("./routes/record"))

app.get('/data', (req, res) => {
  axios.get(process.env.API_DATA_SOURCE)
    .then((response) => res.send(response.data))
    .catch((error) => console.error(error))
})

const server = http.createServer(app)

server.listen(PORT, async () => {
  // perform a database connection when server starts
  await dbo.connectToServer((err) => {
    if (err) {
      console.log('Error connecting to MongoDB', err)
    }

  })
  console.log(`Server listening on ${PORT}`)
  serverReady = true
})

// Middleware to handle server shutdowns
process.on('SIGINT', function () {
  console.log('Server shutting down...')
  // Close the server to prevent new connections
  server.close(() => {
    console.log('Goodbye!')
    process.exit(0)
  })
})

const initPromptSetup = async (record, ws, skipRecord) => {
  if (!skipRecord) {
    const { id, role } = record
    const fieldsToCheck = ['jobDescriptionText', 'salaryInfoAndJobType', 'qualificationsSection']
    const hasAtLeastOneProp = (obj) => fieldsToCheck.some(prop => obj.hasOwnProperty(prop))
  
    let description = await axios
      .get(`http://localhost:5000/record/${id}/linkdata`)
      .then((response) => {
        return response.data
      })
      .catch((error) => sendMessage(ws, error))
  
    let promptData = { id, role }
  
    fieldsToCheck.forEach((field) => {
      if (description[field]) {
        promptData[field] = description[field]
      }
    })
    if (hasAtLeastOneProp) {
      await generateSummary(ws, promptData)
    }
  } else{
    skipRecord = sendMessage(ws, {
      message: 'Not implemented yet',
      data: skipRecord
    })
  }
}
