require("dotenv").config({ path: "./config.env" })
const { default: axios } = require('axios')
const chalk = require('chalk')
const chunkObjects = require("./chunkObjects")
const formatMessage = require("../websocket/formatMessage")
const sendMessage = require("../websocket/sendMessage")

/**
 * The function `checkJobStatuses` retrieves job data or status from a server endpoint for an array of
 * job objects, and returns an object containing the job ID, status, and any retrieved data or errors.
 * @param jobs - An array of job objects.
 * @param statusOnly - A boolean value that determines whether the function should retrieve only the
 * job status or the full job data. If `statusOnly` is true, the function retrieves only the job
 * status. If `statusOnly` is false, the function retrieves the full job data.
 * @returns The function `checkJobStatuses` returns an array of objects containing the job ID, status,
 * and any retrieved data or errors. If an error occurs during the HTTP request, the function logs the
 * error and returns nothing.
 */
const checkJobStatuses = async (jobs, statusOnly) => {
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

      try {
        if (!statusOnly) {
          return axios.get(`${process.env.SERVER_URI}/job-data/${hostname}/${id}`)
            .then(({ data }) => ({ _id, id, status: data.status, puppeteerData: data }))
            .catch((e) => {
              return {
                data: job,
                error: e.response.data,
              }
            })
        } else {
          return axios.get(`${process.env.SERVER_URI}/job-status/${hostname}/${id}`)
            .then(({ data }) => ({ _id, id, status: data.status, puppeteerData: data }))
            .catch((e) => {
              return {
                data: job,
                error: e.response.data,
              }
            })
        }

      } catch (e) {
        console.error('checkJobStatuses error: ', e)
        return
      }

    })

    const chunkResults = await Promise.all(promises)

    results.push(...chunkResults)
  }

  return results
}

/**
 * This function refreshes job records by checking their status, updating their data, and sending
 * messages through a WebSocket.
 * @param data - An array of job objects to be processed.
 * @param ws - The WebSocket object used to send messages about the job refresh process.
 * @param statusOnly - A boolean value indicating whether to only retrieve the job status or data from
 * the server endpoint, without updating the job records.
 * @returns an object with properties `upserted`, `response`, and `insertedId` (if it exists).
 */
const fetchPagesData = async (data, ws, statusOnly) => {
  const filtered = data.filter((datum) => {
    if (!datum.crawlDate) {
      return datum
    } else {
      const diff = Math.abs(new Date() - new Date(datum.crawlDate)) / 36e5
      console.log(chalk.yellow(`Record last crawled ${diff} hours ago`))
      return diff >= 2 && datum.positionStatus === 'open' ? datum : false
      // return datum.positionStatus === 'open' ? datum : false

    }
    
  })

  if (filtered.length === 0) {
    sendMessage(ws, formatMessage(
      'NO_RECORDS_TO_CHECK',
      'No records meeting the required criteria to check',
      {data, filteredData: filtered}
    ))
  }

  console.log(chalk.bgWhite(`${filtered.length} records will be checked`))

  const jobChunks = chunkObjects(filtered, 1)

  let totalJobsProcessed = 0
  let upserted = 0
  let closed = 0
  let response
  let insertedId

  const totalJobs = filtered.length

  /* This code block is iterating over an array of job chunks and processing each job object in each
  chunk. It first calls the `checkJobStatuses` function to retrieve the job status or data from a
  server endpoint for each job object in the chunk. For each job object, it checks whether there is
  an error property in the result object. If there is no error property, it retrieves the
  corresponding record from the `filtered` array using the `id` property, determines whether the
  record is new or not, and updates the record with new data retrieved from the `puppeteerData`
  object. It then sends a message through a WebSocket with information about the job refresh
  process. If the job object has an error property, it sends a message through the WebSocket
  indicating that there was an error refreshing the job. Finally, it waits for 3 seconds before
  processing the next job object. */
  for (const [index, jobChunk] of jobChunks.entries()) {
    const results = await checkJobStatuses(jobChunk, statusOnly)
    let jobsProcessed = 0

    for (const result of results) {

      if (typeof result.error === 'undefined') {

        const record = filtered.find(({ id }) => id === result.id)
        const isNew = !record._id
        const { id, status, org, role, location, puppeteerData, redirected } = result
        const crawlData = { ...puppeteerData, id, crawlDate: new Date().toISOString() }

        !!crawlData.jobDescriptionText && await axios.post(`${process.env.SERVER_URI}/record/${id}/linkdata`, crawlData)

        const url = isNew ? `${process.env.SERVER_URI}/record/new` : `${process.env.SERVER_URI}/record/${result._id}`
        const method = isNew ? 'post' : 'put'
        const body = {
          ...record,
          org: crawlData.org ? crawlData.org : org ? org : record.org,
          role: crawlData.role ? crawlData.role : role ? role : record.role,
          location: crawlData.location ? crawlData.location : location ? location : record.location,
          crawlDate: crawlData.crawlDate,
          externalSource: crawlData.externalSource,
          redirected: redirected ? redirected.toString() : 'false'
        }

        delete body.status1
        delete body.status2
        delete body.status3
        delete body.fieldsModified
        delete body.dateModified

        if (status !== record.positionStatus) {
          body.positionStatus = status
          if (body.positionStatus === 'closed') {
            closed++
          }
        }

        const recordResponse = await axios[method](url, body)
        const { data: responseData } = recordResponse
        const now = new Date().toISOString()

        if (responseData.acknowledged) {
          if (responseData.insertedId) {
            insertedId = responseData.insertedId
          }
        }

        upserted++
        jobsProcessed++
        totalJobsProcessed++

        // maybe we don't need to send the whole jobCchunks array.
        response = {
          action: !isNew ? 'JOB_REFRESHED' : !!insertedId ? 'NEW_JOB_RECORD_ADDED' : 'NEW_JOB_RECORD_NOT_ADDED',
          data: {
            message: `${jobsProcessed} of ${jobChunk.length} jobs in chunk ${index + 1}, ${totalJobsProcessed} of ${totalJobs} jobs total.`,
            job: { ...body, ...(!!insertedId && { _id: insertedId, dateAdded: now, dateModified: now }) },
            ...{ jobsProcessed, jobChunks, totalJobsProcessed, totalJobsProcessed, totalJobs }
          }
        }
        if (ws) {
          require('../websocket/sendMessage')(ws, response)
        }
      } else {
        response = {
          action: 'JOB_REFRESH_ERROR',
          data: {
            message: `Error refreshing job`,
            error: result
          }
        }

        if (ws) {
          require('../websocket/sendMessage')(ws, response)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))

    }

  }

  return { upserted, response, ...(!!insertedId && { insertedId }), closed }
}


module.exports = fetchPagesData