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

      try {
        return axios.get(
          `http://localhost:5000/job-status/${hostname}/${id}`
        ).then(({ data }) => ({ _id, id, status: data.status, extraData: data }))
          
      } catch (error) {
        console.log(error)        
      }

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
 * It takes a list of job records, checks the status of each job, and updates the database with the new
 * status
 * @param ws - websocket connection
 * @param data - an array of objects, each object has an id property
 * @returns The return value is the number of records that were updated.
 */
const fetchPagesData = async (data, ws) => {
  const filtered = data.filter((datum) => {
    if (!datum.crawlDate) {
      return datum
    } else {
      const diff = Math.abs(new Date() - new Date(datum.crawlDate)) / 36e5
      console.log(`Record last crawled ${diff} hours ago`)
      return diff > 24 && datum.positionStatus !== 'closed' ? datum : false
    }
  })

  console.log(`${filtered.length} records will be checked`)
  const jobChunks = chunkObjects(filtered, 12)

  let totalJobsProcessed = 0
  let upserted = 0
  let response
  const totalJobs = filtered.length

  for (const [index, jobChunk] of jobChunks.entries()) {
    const results = await checkJobStatuses(jobChunk)
    let jobsProcessed = 0

    for (const result of results) {
      const record = filtered.find(({id}) => id === result.id)
      const isNew = !record._id
      const { id, status, org, role, location, extraData, redirected } = result
      const crawlData = { ...extraData, id, redirected: redirected === true ? true : false, crawlDate: new Date().toISOString() }

      await axios.post(`http://localhost:5000/record/${id}/linkdata`, crawlData)

      const url = isNew ? 'http://localhost:5000/record/new' : `http://localhost:5000/record/${result._id}`
      const method = isNew ? 'post' : 'put'
      const body = {
        crawlDate: crawlData.crawlDate,
        externalSource: crawlData.externalSource,
        ...record,
        org: org || crawlData.org,
        role: role || crawlData.role,
        location: location || crawlData.location
      }

      delete body.status1
      delete body.status2
      delete body.status3
      delete body.fieldsModified
      
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
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
  }

  return upserted
}

module.exports = fetchPagesData