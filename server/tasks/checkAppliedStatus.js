const { default: axios } = require("axios")
const sendMessage = require("../websocket/sendMessage")
const fetchPagesData = require("./fetchPagesData")

const checkAppiedStatus = async (ws, lastCheck) => {
  const checked = !isNaN(lastCheck)
  const now = new Date()
  const lastCheckDate = !checked ? now : new Date(lastCheck)
  const numOfHoursAgo = Math.abs(now - lastCheckDate) / 36e5

  console.log({ numOfHoursAgo: numOfHoursAgo.toString(), lastCheck })

  if (numOfHoursAgo > 4) {
    const query = {}
    const records = await axios.post('http://localhost:5000/records/email-link-data/?field=dateModified&sort_order=dec', query)

    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))

  let result = await fetchPagesData(meta(records), ws)

  sendMessage(ws, { action: 'CHECK_APPLIED_COMPLETE', data: result })

} else {
    sendMessage(ws, { action: 'CHECK_APPLIED_INCOMPLETE', data: { numOfHoursAgo } })
  }

}

module.exports = checkAppiedStatus