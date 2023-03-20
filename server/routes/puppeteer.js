const express = require('express')
const puppeterRoutes = express.Router()
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const UserAgentPlugin = require('puppeteer-extra-plugin-anonymize-ua');
const userAgent = require('user-agents');

puppeteer.use(StealthPlugin())
puppeteer.use(UserAgentPlugin({ makeWindows: true }))

puppeterRoutes.get('/job-status/:hostdomain/:jobId', async (req, res) => {
  const jobId = req.params.jobId
  const hostdomain = req.params.hostdomain

  console.log(`Received status request for job ID: ${jobId} for ${hostdomain}`)

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  const userAgentString = new userAgent({ deviceCategory: 'desktop' }).toString();
  await page.setUserAgent(userAgentString);

  const data = {}
  let status = 'open'
  let redirected = false
  data.status = 'open'
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.redirectChain().length) {
      console.log(`Redirected to ${request.redirectChain()[0].url()}`)
      redirected = true
      console.log('Redirected')
      data.redirected = true
      data.status = 'closed'
    }
  })

  try {
    if (hostdomain === 'indeed') {
      console.log(`Navigating to https://www.indeed.com/viewjob?jk=${jobId}`)
      await page.goto(`https://www.indeed.com/viewjob?jk=${jobId}`)
      const pageTitle = await page.title()
      
      data.pageTitle = pageTitle
      
      if (!redirected || !pageTitle.includes('Page Not Found')) {

        try {
          const selector =  '.jobsearch-JobComponent > .jobsearch-DesktopStickyContainer'
          const element = await page.waitForSelector(selector, { timeout: 10000 })
          const text = await page.$eval(selector, (element) => element.textContent)
          const closeStr = 'This job has expired on Indeed'
  
          if (element && text.includes(closeStr)) {
            console.log('Job has expired')
            status = 'closed'
            data.status = 'closed'
          }
            
        } catch (error) {

          data.status = 'open'
          data.crawlStatus = JSON.stringify(error)
        }

        if (data.status === 'open') {
          try {
            const selector = '[id="salaryInfoAndJobType"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.salaryInfoAndJobType = text
            }
  
          } catch (error) {

          }
  
          try {
            const selector = '[id="qualificationsSection"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.qualificationsSection = text
            }
  
          } catch (error) {

          }
  
          try {
            const selector = '[id="jobDetailsSection"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.jobDetailsSection = text
            }
  
          } catch (error) {

          }
  
          try {
            const selector = '[id="jobDescriptionText"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.jobDescriptionText = text
            }
  
          } catch (error) {

          }
  
        }
        
      } else {
        status = 'closed'
        data.status = 'closed'
      }
      console.log(`job ID ${jobId} at indeed ${status}`)
      res.send(data)
    } else if (hostdomain === `linkedin`) {
      console.log(`Navigating to https://www.linkedin.com/jobs/view/${jobId}/`)
      await page.goto(`https://www.linkedin.com/jobs/view/${jobId}/`)

      if (!redirected) {

        try {
          const selector = '.top-card-layout__entity-info-container'
          const element = await page.waitForSelector(selector, { timeout: 10000 })
          const text = await page.$eval(selector, (element) => element.textContent)
          const closeStr = 'No longer accepting applications'
  
          if (element && text.includes('No longer accepting applications')) {
              console.log(closeStr)
              status = 'closed'
            }

        } catch (error) {

          data.status = 'open'
          data.crawlStatus = JSON.stringify(error)
        }

        if (data.status === 'open') {
          
          try {
            const showMore = '.core-section-container > .core-section-container__content > .description__text > .show-more-less-html > .show-more-less-html__button--more'
            await page.waitForSelector(showMore, { timeout: 10000 })
            await page.click(showMore)

            const selector = '.core-section-container__content.break-words'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.jobDescriptionText = text
            }
  
          } catch (error) {
            await page.screenshot({ path: `screenshot-linkedin-${jobId}.png` })
            data.crawlStatus = JSON.stringify(error)
          }
        }
        
        
      } else {
        status = 'closed'
        data.status = 'closed'
      }
      console.log(`job ID ${jobId} at linkedin ${status}`)
      res.send(data)

    }
  } catch (error) {
    console.log(`Error processing ${hostdomain} job id ${jobId}`)
    console.error(error)
    res.status(500).send({ error: 'Internal server error' })
  } finally {
  await browser.close()
  }
})

module.exports = puppeterRoutes