const express = require("express")
const axios = require("axios")
const cors = require("cors")
const fs = require("fs")
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

app.use(require("./routes/record"))
 
app.get('/data', (req, res) => {
  axios.get(process.env.API_DATA_SOURCE)
    .then((response) => res.send(response.data))
    .catch((error) => console.error(error))
  // // Read the contents of the JSON file
  // fs.readFile('./data.json', 'utf8', (err, data) => {
  //   if (err) {
  //     console.error(err)
  //     res.status(500).json({ error: 'Internal server error' })
  //     return
  //   }

  //   // Parse the JSON data
  //   const jsonData = JSON.parse(data)

  //   // Send the JSON data as a response
  //   res.json(jsonData)
  // })
})

app.post("/data/save", (req, res) => {
  const data = req.body
  const fileName = "data.json"
  fs.writeFile(fileName, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err)
      res.status(500).send("Error saving data")
    } else {
      res.send("Data saved successfully")
    }
  })
})

app.listen(PORT, async () => {
  // perform a database connection when server starts
  await dbo.connectToServer(function (err) {
    if (err) console.error(err)
 
  })

  console.log(`Server listening on ${PORT}`)
})
