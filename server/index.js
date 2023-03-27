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

wss.on('connection', async (ws) => {
  let lastFetch
  let lastCheck
  ws.on('message', async (data) => {
    const {message} = JSON.parse(data)
    if (message === 'Check for new records') {
      await checkForNewRecords(ws)
      lastFetch = new Date().toISOString()
    }
    if (message === 'Check applied postings status') {
      await checkAppiedStatus(ws, lastCheck)
      lastCheck = new Date().toISOString()
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