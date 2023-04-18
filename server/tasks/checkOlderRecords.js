const axios = require("axios")
const chalk = require("chalk")
const chunkObjects = require("../tasks/chunkObjects")
const fetchPagesData = require("./fetchPagesData")
const meta = require("../meta")
const formatMessage = require("../websocket/formatMessage")
const sendMessage = require("../websocket/sendMessage")

const checkOlderRecords = async (ws) => {
  const query = {
    positionStatus: 'open'
  }

  const records = await axios.post(`${process.env.SERVER_URI}/records/email-link-data/`, query)
    .then((response) => {
      console.log(`${response.data.length} open records in total`)
      return response.data
    })
    .catch((error) => console.error(error))

  const filtered = records.filter((datum) => {
    if (!datum.crawlDate) {
      return datum
    } else {
      const diff = Math.abs(new Date() - new Date(datum.crawlDate)) / 36e5
      return diff >= 2 ? datum : false
    }

  })

  const chunks = chunkObjects(filtered, 24)
  const totalChunks = chunks.length
  let chunksLeft = totalChunks
  let jobsLeft = filtered.length
  let recordsClosed = 0

  console.log(chalk.blueBright(`Starting task... task split into ${totalChunks} chunks`))
  for (const records of chunks) {

    let recordsChecked = 0
    const result = await fetchPagesData(meta(records), ws, true)
    const { response, closed } = result
    const { data } = response

    // increment the counter if there are no errors
    !data.error && recordsChecked++

    const message = formatMessage(
      !data.error ? 'UPDATE_24_OLDEST_SUCCESS' : 'UPDATE_24_OLDEST_ERROR',
      !data.error ?
        `${recordsChecked} records checked, ${closed} positions closed or expired`
        : `Failed to fetch page data ${data.error && JSON.stringify({ error: data.error })}`,
      !data.error ? { timestamp: new Date().toISOString(), closed } : { error: data.error }
    )

    chunksLeft--
    jobsLeft--
    recordsClosed += closed

    let report = `${chunksLeft} chunks left, ${recordsClosed} records closed, ${jobsLeft} jobs to check remaining`
    console.log(chalk.blueBright(`${chunksLeft} chunks left, ${recordsClosed} records closed, ${jobsLeft} jobs to check remaining`))

    sendMessage(ws, message)
    sendMessage(ws, formatMessage(
      'UPDATE_24_OLDEST_REPORT',
      report,
      { chunksLeft, recordsClosed, jobsLeft }
    ))

  }
}

module.exports = checkOlderRecords