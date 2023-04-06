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

const sendQueriedRecordsToPrompt = require("./tasks/sendQueriedRecordsToPrompt")
const initPromptSetup = require("./chatgpt/initPromptSetup")

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
      await initPromptSetup(record, ws)
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

    if (message === 'Send queried records to chatgpt prompt') {
      await sendQueriedRecordsToPrompt(ws, query)
    }
  })

  if (!lastFetch) {
    const data = { lastFetch: false }
    const payload = { action: 'LAST_FETCH_FALSE', data }
    sendMessage(ws, payload)


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
