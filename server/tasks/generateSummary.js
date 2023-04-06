require("dotenv").config({ path: "../config.env" })
const { default: axios } = require("axios")
const sendPrompt = require("../chatgpt")
const generateChatPrompt = require("../chatgpt/generateChatPrompt")
const sendMessage = require("../websocket/sendMessage")
const { NodeHtmlMarkdown } = require("node-html-markdown")

const generateSummary = async (ws, record) => {

  const nhm = new NodeHtmlMarkdown()
  const tokenCount = (str) => {
    return str.split(/\s+/).length
  }
  const truncateStringToTokenCount = (str, num) => {
    return str.split(/\s+/).slice(0, num).join(" ");
}
  const fieldsToCheck = ['jobDescriptionText', 'salaryInfoAndJobType', 'qualificationsSection']
  let promptData = {}
  let skipRecord = false

  fieldsToCheck.forEach(async (field) => {
    if (record[field]) {
      const markdown = nhm.translate(record[field])
      if (tokenCount(markdown) <= 1200) {
        promptData[field] = markdown
      } else {
        // handle this situation, should try a different prompt strategy instead of truncate
        await axios.post(`${process.env.SERVER_URI}/logging/chatgpt-error-log`, {
            type: 'TOKEN_COUNT_EXCEEDED',
            data: { id: record.id, tokenCount: tokenCount(nhm.translate(record[field])) }
          })
          .catch((error) => {
            console.error(error)
          })

        sendMessage(ws, {
          message: 'TOKEN_COUNT_EXCEEDED',
          data: { id: record.id, tokenCount: tokenCount(nhm.translate(record[field])) }
        })
        skipRecord = true
      }
    }
  })

  if (!skipRecord) {

    try {
      const { prompt, title } = await generateChatPrompt(promptData)
      const completion = await sendPrompt(prompt)
      const { prompt_tokens, completion_tokens, total_tokens } = completion.data.usage

      if (completion) {

        const cost = {
          prompt_tokens: prompt_tokens,
          completion_tokens: completion_tokens,
          total_tokens: total_tokens,
        }

        const payload = {
          id: record.id,
          response: {
            result: completion.data.choices["0"].message.content,
            title: title,
            ...cost
          },
          // run a query later to set this to all existing docs in the collection
          dateAdded: new Date().toISOString(),
        }

        let parsedResponse

        try {
          parsedResponse = JSON.parse(payload.response.result)
        } catch (error) {

          try {
            parsedResponse = JSON.parse(payload.response.result.trim())
          } catch (error) {
            parsedResponse = JSON.parse(JSON.stringify(payload.response.result.trim()).trim())
          }
        }

        sendMessage(ws, {
          message: 'PROMPT_COMPLETION',
            data: { id: record.id, cost, parsedResponse }
        })
        console.log('----------PROMPT_COMPLETION----------')

        
        if (parsedResponse.summary !== '') {
          payload.response.result = parsedResponse
          await axios
          .post(`${process.env.SERVER_URI}/record/${record.id}/summary`, payload)
          
          sendMessage(ws, {
            message: 'SUMMARY_RECORD_INSERTED',
            data: { id: record.id, cost, payload }
          })
          console.log('----------SUMMARY_RECORD_INSERTED----------')
        } else {

          await axios
            .post(`${process.env.SERVER_URI}/logging/chatgpt-error-log`, {
              type: 'SUMMARY_RECORD_INCOMPLETE',
              data: payload,
              completion: { id: record.id, cost, prompt, result: completion.data }

            })

          sendMessage(ws, {
            message: 'SUMMARY_RECORD_INCOMPLETE',
            data: { id: record.id, cost, prompt, result: completion.data }
          })
          console.log('----------SUMMARY_RECORD_INCOMPLETE----------')
        }
      }

    } catch (error) {
      console.error(error)
    } finally {
    }

  } else {


  }
}

module.exports = generateSummary