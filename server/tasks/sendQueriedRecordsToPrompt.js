require("dotenv").config({ path: "../config.env" })
const { default: axios } = require("axios")
const meta = require("../meta")
const sendMessage = require("../websocket/sendMessage")
const initPromptSetup = require("../chatgpt/initPromptSetup")

const sendQueriedRecordsToPrompt = async(ws, query) => {

  let records = []
  await axios
    .post(`${process.env.SERVER_URI}/records/email-link-data/?field=dateModified&sort_order=dec`, query)
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
    await axios.post(`${process.env.SERVER_URI}/records/chatgpt-summary-responses/`, { id })
      .then(async ({ data }) => {
        // check if record already exist, replace only if summary is malformed
        if (data.length >= 1) {
          try {
            result = JSON.parse(data[0].response.result)
          } catch (error) {
            let test = data[0].response.result

            try {
              if (test.hasOwnProperty('summary')) {
                summary = data[0].response.result

              }
            } catch (error) {

              await axios
                .post(`${process.env.SERVER_URI}/logging/chatgpt-error-log`, {
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

module.exports = sendQueriedRecordsToPrompt