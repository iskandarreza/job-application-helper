const { Configuration, OpenAIApi } = require("openai")

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

const sendPrompt = async (prompt) => {
  if (!prompt) {
    return
  }
  
  const chatInput = {
    model: "gpt-3.5-turbo",
    messages: prompt,
    temperature: 0.4,
    // max_tokens: 1800
  }
  console.log('----------------SENDING PROMPT TO OPENAI---------------------')
  console.log('model: ' + chatInput.model)
  console.log('----------------SENDING PROMPT TO OPENAI---------------------')

  const completion = await openai.createChatCompletion(chatInput)

  return completion
  
}
module.exports = sendPrompt

