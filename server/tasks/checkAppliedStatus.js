const { default: axios } = require("axios")
const sendMessage = require("../websocket/sendMessage")
const fetchPagesData = require("./fetchPagesData")
const meta = require("../meta")

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

    const records = await axios.post('http://localhost:5000/records/email-link-data/?field=dateModified&sort_order=dec', query)

    .then((response) => {
      return response.data
    })
    .catch((error) => console.error(error))

  let result = await fetchPagesData(meta(records), ws)

  sendMessage(ws, { action: 'CHECK_APPLIED_COMPLETE', data: result })

}

module.exports = checkAppiedStatus