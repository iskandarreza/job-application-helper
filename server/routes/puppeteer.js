const express = require('express')
const puppeterRoutes = express.Router()
const startInstance = require('../puppeteer/startInstance')
const { linkedIn, indeed } = require('../puppeteer/microTasks')

puppeterRoutes.get('/job-status/:hostdomain/:jobId', async (req, res) => {
  const jobId = req.params.jobId
  const hostdomain = req.params.hostdomain

  const data = await startInstance(jobId, hostdomain)

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

  const callbackArray = hostdomain === 'linkedIn' ?
  [
    linkedIn.linkedInCheckExternalLink,
    linkedIn.linkedInGetDescription,
    linkedIn.linkedInGetRoleLocation
  ] :
  [
    indeed.indeedCheckExternalLink,
    indeed.indeedGetDescription,
    indeed.indeedGetOrgName,
    indeed.indeedGetQualifications,
    indeed.indeedGetRoleLocation,
    indeed.indeedGetRoleTitle,
    indeed.indeedGetSalaryInfo,
    indeed.indeedGetSummary
  ]
  
  const data = await startInstance(jobId, hostdomain, callbackArray)

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