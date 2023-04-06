require("dotenv").config({ path: "./config.env" })
const { default: axios } = require("axios")
const generateSummary = require("../tasks/generateSummary")
const sendMessage = require("../websocket/sendMessage")

const initPromptSetup = async (record, ws, skipRecord) => {
  if (!skipRecord) {
    const { id, role } = record
    const fieldsToCheck = ['jobDescriptionText', 'salaryInfoAndJobType', 'qualificationsSection']
    const hasAtLeastOneProp = (obj) => fieldsToCheck.some(prop => obj.hasOwnProperty(prop))
  
    let description = await axios
      .get(`${process.env.SERVER_URI}/record/${id}/linkdata`)
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
    } else {
      sendMessage(ws, {
        message: 'NO_DATA_TO_SEND_TO_PROMPT',
        data: { ...record }
      })
    }

  } else{
    skipRecord = sendMessage(ws, {
      message: 'Not implemented yet',
      data: skipRecord
    })
  }
}

module.exports = initPromptSetup