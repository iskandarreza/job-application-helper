const express = require('express')
const puppeterRoutes = express.Router()
const crawlJobPage = require('../puppeteer/crawlJobPage');
const positionStatus = require('../puppeteer/positionStatus');

puppeterRoutes.get('/job-status/:hostdomain/:jobId', async (req, res) => {
  const jobId = req.params.jobId
  const hostdomain = req.params.hostdomain

  const data = await positionStatus(jobId, hostdomain)

  try {
    if (data.success) {
      res.send(data.success)
    }
    if (data.error) {
      res.status(500).send(data.error)
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal server error', data: error })
  }
})

puppeterRoutes.get('/job-data/:hostdomain/:jobId', async (req, res) => {
  const jobId = req.params.jobId
  const hostdomain = req.params.hostdomain

  const data = await crawlJobPage(jobId, hostdomain)

  try {
    if (data.success) {
      res.send(data.success)
    }
    if (data.error) {
      res.status(500).send(data.error)
    }
  } catch (error) {
    res.status(500).send({ error: 'Internal server error', data: error })
  }
})

module.exports = puppeterRoutes