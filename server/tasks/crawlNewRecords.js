const express = require('express')
const taskRoutes = express.Router()
const { default: axios } = require('axios')

/**
 * It takes an array of objects, chunks them into arrays of 3, and then makes an axios request for each
 * object in the chunk.
 * @param jobs - an array of objects that look like this:
 * @returns An array of objects.
 */
const checkJobStatuses = async (jobs) => {
  const results = []

  const chunks = chunkObjects(jobs, 3)

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

/**
 * It takes an array and a number, and returns an array of arrays, each of which is the size of the
 * number.
 * @param data - The array of objects you want to chunk
 * @param size - The number of items you want in each chunk.
 * @returns An array of arrays.
 */
const chunkObjects = (data, size) => {
  const chunks = []
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size))
  }
  return chunks
}

/**
 * It takes an array of objects, chunks it into smaller arrays of objects, then sends each chunk to a
 * function that checks the status of each object in the chunk, and then sends the data to an API
 * endpoint.
 * @param ws - websocket connection
 * @param data - an array of objects
 * @returns The response is being returned.
 */
const fetchAndInsertNewRecords = async (ws, data) => {
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
        await axios.post(`http://localhost:5000/record/${id}/linkdata`, crawlData)
        console.log(`Closed job ${id}`)

      } else {
        await axios.post(`http://localhost:5000/record/${id}/linkdata`, crawlData)
      }

      await axios.post(`http://localhost:5000/record/new`, {
        ...record,
        ...crawlData,
        positionStatus: status,
        externalSource: crawlData.externalSource
      })

      jobsProcessed++
      totalJobsProcessed++
      response = `Processed ${jobsProcessed} of ${jobChunk.length} jobs in chunk ${index + 1}, ${totalJobsProcessed} of ${totalJobs} jobs total.`
      console.log(response)
      require('../websocket/sendMessage')(ws, response)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  return response
}

module.exports = fetchAndInsertNewRecords