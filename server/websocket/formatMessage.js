const payload = (message, data) => { return { message, data } }
const formatMessage = (action, message, data) => {
  return {
    action, data: payload(message, data)
  }
} 

module.exports = formatMessage