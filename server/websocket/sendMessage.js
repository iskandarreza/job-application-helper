/**
 * It takes a websocket, a message, and a recipient, and sends the message to the recipient
 * @param ws - the websocket connection
 * @param message - the message to send
 * @param recipient - the recipient of the message. If not specified, the message will be sent to the
 * webworker.
 */
const sendMessage = (ws, message, recipient) => {
  const receiver = !recipient ? 'webworker' : recipient  
  const payload = JSON.stringify({ receiver, message })
  ws.send(payload)
  console.log({sendMessage: message})
}

module.exports = sendMessage