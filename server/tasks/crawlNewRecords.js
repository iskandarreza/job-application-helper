const express = require('express')
const taskRoutes = express.Router()
const { default: axios } = require('axios')

const checkJobStatuses = async (jobs) => {
  const results = []

  const chunks = chunkObjects(jobs, 1)

  for (const chunk of chunks) {
    const promises = chunk.map((job) => {
      const { id, _id, url } = job

      let hostname
      if (url.includes('indeed')) {
        hostname = 'indeed'
      } else if (url.includes('linkedin')) {
        hostname = 'linkedin'
      }

      return axios.get(
        `http://localhost:5000/job-status/${hostname}/${id}`
      ).then(({ data }) => ({ _id, id, status: data.status, extraData: data }))
    })

    const chunkResults = await Promise.all(promises)

    results.push(...chunkResults)
  }

  return results
}

const chunkObjects = (data, size) => {
  const chunks = []
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size))
  }
  return chunks
}

const fetchAndInsertNewRecords = async () => {
  const { data } = await axios.get('http://localhost:5000/record/new')
  const jobChunks = chunkObjects(data, 12)

  let totalJobsProcessed = 0
  let response
  const totalJobs = data.length
  for (const [index, jobChunk] of jobChunks.entries()) {
    const results = await checkJobStatuses(jobChunk)

    let jobsProcessed = 0
    for (const result of results) {
      const { id, status, extraData, redirected } = result
      let record = jobChunk[index]
      let crawlData = { ...extraData }
      crawlData.id = id
      crawlData.redirected = redirected === true ? true : false
      crawlData.crawlDate = new Date().toISOString()

      if (status === 'closed') {
        await axios.post(`http://localhost:5000/record/linkdata/${id}`, crawlData)
        console.log(`Closed job ${id}`)

      } else {
        await axios.post(`http://localhost:5000/record/linkdata/${id}`, crawlData)
      }

      await axios.post(`http://localhost:5000/record/add`, {
        ...record,
        ...crawlData,
        positionStatus: status,
        externalSource: crawlData.externalSource
      })

      jobsProcessed++
      totalJobsProcessed++
      response = `Processed ${jobsProcessed} of ${jobChunk.length} jobs in chunk ${index + 1}, ${totalJobsProcessed} of ${totalJobs} jobs total.`
      console.log(response)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  return response
}

taskRoutes.get('/pull-new-data', (req, res) => {
  fetchAndInsertNewRecords().then((data) => {
    res.send(data)
    console.log(data)
  }).catch((e) => console.log(e))
})

module.exports = taskRoutes