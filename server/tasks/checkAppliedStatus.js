const { default: axios } = require("axios")
const sendMessage = require("../websocket/sendMessage")
const fetchPagesData = require("./fetchPagesData")
const meta = require("../meta")
const formatMessage = require("../websocket/formatMessage")

const checkAppiedStatus = async (ws) => {
    const query = {
      "$and": [
        {
          "positionStatus": "open"
        },
        {
          "$or": [
            {
              "status1": "uncertain"
            },
            {
              "status1": "applied"
            }
          ]
        }
      ]
    }

    const records = await axios.post(`${process.env.SERVER_URI}/records/email-link-data/?field=dateModified&sort_order=dec`, query)

    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))

  let result = await fetchPagesData(meta(records), ws, true)

  // TODO: send a better message
  !!result.response && sendMessage(ws, formatMessage('CHECK_APPLIED_COMPLETE', result.response.data.message, result.response.data.job))

}

module.exports = checkAppiedStatus