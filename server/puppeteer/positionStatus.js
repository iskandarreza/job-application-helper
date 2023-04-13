const chalk = require('chalk')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const UserAgentPlugin = require('puppeteer-extra-plugin-anonymize-ua')
const userAgent = require('user-agents')

puppeteer.use(StealthPlugin())
puppeteer.use(UserAgentPlugin({ makeWindows: true }))

/**
 * It takes a job ID and a host domain as parameters, and returns an object with a success property
 * that contains the job data, or an error property that contains the error
 * @param jobId - The ID of the job you want to crawl
 * @param hostdomain - the domain of the job posting site
 * @returns a promise.
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
  data.status = 'open'
  page.on('request', async (request) => {
    if (request.isNavigationRequest() && request.redirectChain().length) {
      console.log(chalk.bgYellow(`Redirected to ${request.redirectChain()[0].url()}`))
      redirected = true
      console.log(chalk.magentaBright('Redirected'))
      data.redirected = 'true'
      await page.screenshot({ path: `redirected-${hostdomain}-${jobId}.png` })

    }
  })

  try {
    if (hostdomain === 'indeed') {
      console.log(`Navigating to https://www.indeed.com/viewjob?jk=${jobId}`)
      const response = await page.goto(`https://www.indeed.com/viewjob?jk=${jobId}`)
      const pageTitle = await page.title()
      
      data.pageTitle = pageTitle
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
          data.crawlStatus = JSON.stringify(error)

        }
        
      } else {
        data.redirected = 'true'
        data.error = response
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
          data.crawlStatus = JSON.stringify(error)

        }

        
      } else {
        data.redirected = 'true'
        data.error = response
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
    // console.error(error)
    return {
      error: {
        response, data
      }
    }
  } finally {
  await browser.close()
  }
}

module.exports = positionStatus