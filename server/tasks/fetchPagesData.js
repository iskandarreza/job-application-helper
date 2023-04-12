require("dotenv").config({ path: "./config.env" })
const { default: axios } = require('axios')
const chalk = require('chalk')
const chunkObjects = require("./chunkObjects")

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
              job,             
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
 * The function fetches data, filters it based on certain criteria, checks the status of job positions,
 * updates the records, and sends messages through a WebSocket.
 * @param data - An array of job data objects to be filtered and checked for updates.
 * @param ws - The "ws" parameter is likely a WebSocket object used for sending messages to a client in
 * real-time.
 * @param statusOnly - The `statusOnly` parameter is a boolean value that determines whether the
 * function should only check the status of the jobs or also update their data. If `statusOnly` is
 * true, the function will only check the status of the jobs and return the results without updating
 * any data. If `statusOnly
 * @returns an object with two properties: "upserted" and "response". The "upserted" property contains
 * the number of records that were updated or inserted into the database. The "response" property
 * contains an object with information about the job refresh process, including any errors that
 * occurred and the status of each job that was processed.
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

  console.log(chalk.bgWhite(`${filtered.length} records will be checked`))
  const jobChunks = chunkObjects(filtered, 1)

  let totalJobsProcessed = 0
  let upserted = 0
  let response
  const totalJobs = filtered.length

  for (const [index, jobChunk] of jobChunks.entries()) {
    const results = await checkJobStatuses(jobChunk, statusOnly)
    let jobsProcessed = 0

    for (const result of results) {
      if (!result.job || !result.error) {

        const record = filtered.find(({id}) => id === result.id)
        const isNew = !record._id
        const { id, status, org, role, location, puppeteerData, redirected } = result
        const crawlData = { ...puppeteerData, id, crawlDate: new Date().toISOString() }
  
        await axios.post(`${process.env.SERVER_URI}/record/${id}/linkdata`, crawlData)
  
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
        }
        
        await axios[method](url, body)
        
        upserted++
        jobsProcessed++
        totalJobsProcessed++
        response = {
          action: 'JOB_REFRESHED',
          data: {
            message: `Processed ${jobsProcessed} of ${jobChunk.length} jobs in chunk ${index + 1}, ${totalJobsProcessed} of ${totalJobs} jobs total.`,
            job: body
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
            error: Object.keys(result.error).length === 0 ? 
              { statusCode: result.data.statusCode } : result.error
          }
        }
        
        console.log({response})
        if (ws) {
          require('../websocket/sendMessage')(ws, response)
        }
      }
  
      await new Promise((resolve) => setTimeout(resolve, 3000))

      }

  }

  return {upserted, response}
}

module.exports = fetchPagesData