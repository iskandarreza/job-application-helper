const { default: axios } = require("axios")
const fetchPagesData = require("./fetchPagesData")

const checkAppiedStatus = async (ws, lastCheck) => {
  const checked = !isNaN(lastCheck)
  const now = new Date()
  const lastCheckDate = !checked ? now : new Date(lastCheck)
  const numOfHoursAgo = Math.abs(now - lastCheckDate) / 36e5

  console.log({ numOfHoursAgo: numOfHoursAgo.toString(), lastCheck })

  if (numOfHoursAgo > 24) {
    const records = await axios.get('http://localhost:5000/record?filter=applied')
      .then((response) => {
        return response.data
      })
      .catch((error) => console.error(error))
    const result = await fetchPagesData(ws, records)

    console.log(`${result} records updated`)
  }
}

module.exports = checkAppiedStatus