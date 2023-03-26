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

const runTask = async () => {
  const { data } = await axios.get('http://localhost:5000/record/open')
  const jobChunks = chunkObjects(data, 12)

  let totalJobsProcessed = 0
  const totalJobs = data.length
  for (const [index, jobChunk] of jobChunks.entries()) {
    const results = await checkJobStatuses(jobChunk)

    let jobsProcessed = 0
    for (const result of results) {
      const { _id, id, status, extraData, redirected } = result
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

      await axios.post(`http://localhost:5000/update/${_id}`, {
        crawlDate: crawlData.crawlDate,
        positionStatus: status,
        org: crawlData.org,
        role: crawlData.role,
        location: crawlData.location,
        externalSource: crawlData.externalSource
      })

      jobsProcessed++
      totalJobsProcessed++
      console.log(`Processed ${jobsProcessed} of ${jobChunk.length} jobs in chunk ${index + 1}, ${totalJobsProcessed} of ${totalJobs} jobs total.`)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
}

runTask()