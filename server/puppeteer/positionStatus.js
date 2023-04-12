const chalk = require('chalk')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const UserAgentPlugin = require('puppeteer-extra-plugin-anonymize-ua')
const userAgent = require('user-agents')

puppeteer.use(StealthPlugin())
puppeteer.use(UserAgentPlugin({ makeWindows: true }))

/**
 * The function checks the status of a job posting on either Indeed or LinkedIn by navigating to the
 * job page and checking if it is still open.
 * @param jobId - The ID of the job posting to check the status of.
 * @param hostdomain - The domain of the job posting website, either "indeed" or "linkedin".
 * @returns a Promise that resolves to an object with either a "success" or "error" property. The
 * "success" property contains an object with information about the job position, including its status
 * (open or closed), whether it was redirected, and any error messages. The "error" property contains
 * an object with information about the error that occurred during processing, including the error
 * message and any data that was collected during the crawl.
 */
const positionStatus = async (jobId, hostdomain) => {
  console.log('')
  console.log(chalk.whiteBright(`Received status request for job ID: ${jobId} for ${hostdomain}`))

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  const userAgentString = new userAgent({ deviceCategory: 'desktop' }).toString();
  await page.setUserAgent(userAgentString);

  const data = {}
  let status = 'open'
  let redirected = false
  data.redirected = 'false'
  data.statusCode = null
  data.statusText = null
  data.requestCount = 0
  data.status = 'open'
  data.crawlStatus = []


  /* This code block is listening for requests made by the page and checking if any of them are
  navigation requests that result in a redirect. If a redirect is detected, it sets the `redirected`
  variable to `true`, logs a message indicating that a redirect occurred, and takes a screenshot of
  the page at the time of the redirect. It also updates the `data` object with information about the
  redirect. */
  page.on('request', async (request) => {
    if (request.isNavigationRequest() && request.redirectChain().length) {
      console.log(chalk.bgYellow(`Redirected to ${request.redirectChain()[0].url()}`))
      redirected = true
      console.log(chalk.magentaBright('Redirected'))
      data.redirected = 'true'
      await page.screenshot({ path: `redirected-${hostdomain}-${jobId}.png` })

    }

    if (request.response()) {
      console.log({response: request.response()})
      data.requestCount++
    }
  })

  try {
    if (hostdomain === 'indeed') {
      console.log(`Navigating to https://www.indeed.com/viewjob?jk=${jobId}`)
      const response = await page.goto(`https://www.indeed.com/viewjob?jk=${jobId}`)
      const pageTitle = await page.title()
      
      data.pageTitle = pageTitle

      data.statusCode = response.status()
      data.statusText = response.statusText()
      console.log({statusCode: data.statusCode, statusText: data.statusText})

      if (pageTitle.includes('Page Not Found')) {
        await page.screenshot({ path: `404-indeed-${jobId}.png` })
        redirected = true
        status = 'closed'
      }
      
      if (!redirected && response.status() === 200) {

        console.log('Checking if job is stil open...')
        try {
          const selector =  '.jobsearch-JobComponent > .jobsearch-DesktopStickyContainer'
          const element = await page.waitForSelector(selector, { timeout: 10000 })
          const text = await page.$eval(selector, (element) => element.textContent)
          const closeStr = 'This job has expired on Indeed'
  
          if (element && text.includes(closeStr)) {
            console.log(chalk.redBright('Job has expired'))
            status = 'closed'
            data.status = 'closed'
          }
            
        } catch (error) {
          console.log(chalk.red('Could not determine position status'))
          await page.screenshot({ path: `positionStatus-indeed-${jobId}.png` })
          data.crawlStatus.push(JSON.stringify(error))
        }
        
      } else {
        data.redirected = 'true'
      }

      // update status after crawl
      data.status = status

      if (status === 'open') {
        console.log(chalk.bgGreenBright(`job ID ${jobId} at indeed ${status}`))
      } else {
        console.log(chalk.bgRedBright(`job ID ${jobId} at indeed ${status}`))
      }      
      return {
        success: data
      }



    } else if (hostdomain === `linkedin`) {
      console.log(`Navigating to https://www.linkedin.com/jobs/view/${jobId}/`)
      const response = await page.goto(`https://www.linkedin.com/jobs/view/${jobId}/`)

      data.statusCode = response.status()
      data.statusText = response.statusText()
      console.log({statusCode: data.statusCode, statusText: data.statusText})


      if (!redirected && response.status() === 200) {

        console.log('Checking if job is stil open...')
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
          console.log(chalk.red('Could not determine position status'))
          await page.screenshot({ path: `positionStatus-linkedin-${jobId}.png` })
          data.crawlStatus.push(JSON.stringify(error))

        }

        
      } else {
        data.redirected = 'true'
      }

      data.status = status

      if (status === 'open') {
        console.log(chalk.bgGreenBright(`job ID ${jobId} at linkedin ${status}`))
      } else {
        console.log(chalk.bgRedBright(`job ID ${jobId} at linkedin ${status}`))
      }
      return {
        success: data
      }
    }
  } catch (error) {
    console.log(chalk.redBright(`Error processing ${hostdomain} job id ${jobId}`))
    return {
      error: {
        error, data
      }
    }
  } finally {
  await browser.close()
  }
}

module.exports = positionStatus