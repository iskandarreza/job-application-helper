const { default: axios } = require("axios")
const sendPrompt = require("../chatgpt")
const generateChatPrompt = require("../chatgpt/generateChatPrompt")
const sendMessage = require("../websocket/sendMessage")

const generateSummary = async (ws, record) => {
  const recordMatch = await axios
    .post('http://localhost:5000/records/chatgpt-summary-responses/', {
      id: record.id
    })
    .then((response) => {
      return response.data
    })

  if (recordMatch.length > 0) {
    sendMessage(ws, recordMatch)

  } else {

    try {
      const { prompt, title } = await generateChatPrompt(record)
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

        console.log({ cost })
        await axios
          .post(`http://localhost:5000/record/${record.id}/summary`, payload)
          .then((response) => console.log(response.data))

        sendMessage(ws, payload)

      }

    } catch (error) {
      console.error(error)
    } finally {
    }

  }
}

module.exports = generateSummary