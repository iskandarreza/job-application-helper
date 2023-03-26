const express = require('express')
const puppeterRoutes = express.Router()
const crawlJobPage = require('../puppeteer/crawlJobPage');

puppeterRoutes.get('/job-status/:hostdomain/:jobId', async (req, res) => {
  const jobId = req.params.jobId
  const hostdomain = req.params.hostdomain

  const data = await crawlJobPage(jobId, hostdomain)

  try {
    if (data.success) {
      res.send(data.success)
    }
  } catch (error) {
    if (data.error) {
      res.status(500).send({ error: 'Internal server error' })
    }
  }
})

module.exports = puppeterRoutes