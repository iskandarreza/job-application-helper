const express = require("express")
const axios = require("axios")
const cors = require("cors")
const app = express()

require("dotenv").config({ path: "./config.env" })
const PORT = process.env.PORT || 5000
// get driver connection
const dbo = require("./db/conn")

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

app.use(require("./tasks/crawlNewRecords"))

app.get('/data', (req, res) => {
  axios.get(process.env.API_DATA_SOURCE)
    .then((response) => res.send(response.data))
    .catch((error) => console.error(error))
})

app.listen(PORT, async () => {
  // perform a database connection when server starts
  await dbo.connectToServer(function (err) {
    if (err) console.error(err)
 
  })

  console.log(`Server listening on ${PORT}`)
})
