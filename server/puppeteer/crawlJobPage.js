const chalk = require('chalk')
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const UserAgentPlugin = require('puppeteer-extra-plugin-anonymize-ua')
const userAgent = require('user-agents')

puppeteer.use(StealthPlugin())
puppeteer.use(UserAgentPlugin({ makeWindows: true }))

/**
 * The function crawls job postings on Indeed and LinkedIn, extracting various information about the
 * job and checking if the job is still open and if there is an external link to apply on the company's
 * website.
 * @param jobId - The ID of the job posting that needs to be crawled.
 * @param hostdomain - The website domain where the job posting is located, either "indeed" or
 * "linkedin".
 * @returns an object with the extracted data and the job status. If the function encounters an error,
 * it returns an object with the error and the data object.
 */
const crawlJobPage = async (jobId, hostdomain) => {
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
  data.externalSource = false
  data.crawlStatus = []
  
  /* The code below is using the Puppeteer library in JavaScript to listen for navigation requests and
  check if there is a redirect chain. If there is a redirect chain, it logs the first URL in the
  chain, sets a flag to indicate that the page was redirected, takes a screenshot of the page, and
  updates a data object with the value 'true' for the 'redirected' property. */
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
      const response = await page.goto(`https://www.indeed.com/viewjob?jk=${jobId}`, {
        waitUntil: 'load',
        // Remove the timeout
        timeout: 0
      })

      const pageTitle = await page.title()

      data.statusCode = response.status()
      data.statusText = response.statusText()
      console.log({statusCode: data.statusCode, statusText: data.statusText})

      if (response.status === 200) {
        data.pageTitle = pageTitle
        if (pageTitle.includes('Page Not Found')) {
          redirected = true
        }  
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

        if (data.status === 'open') {
         
          console.log('Checking for external link...')

          try {
            const selector = '#viewJobButtonLinkContainer > #applyButtonLinkContainer'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerText)
              
              if (text.includes('Apply on company site')) {
                data.externalSource = 'true'
              }
            }
  
          } catch (error) {
            console.log(chalk.red('External link unavailable'))
          }

          console.log('Getting title of the role...')

          try {
            const selector = '.jobsearch-JobInfoHeader-title-container'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerText)
              data.role = text
            }
  
          } catch (error) {
            console.log(chalk.red('Job title info unavailable'))
          }

          console.log('Getting the organization name...')

          try {
            const selector = '.jobsearch-CompanyInfoWithoutHeaderImage > div > div > div:nth-child(1)'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerText)
              data.org = text
            }
  
          } catch (error) {
            console.log(chalk.red('Organization info unavailable'))
          }

          console.log('Getting the role location...')

          try {
            const selector = '.jobsearch-CompanyInfoWithoutHeaderImage > div > div > div:nth-child(2)'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerText)
              data.location = text
            }
  
          } catch (error) {
            console.log(chalk.red('Job location info unavailable'))
          }

          console.log('Getting salary info and job type...')
          try {
            const selector = '[id="salaryInfoAndJobType"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.salaryInfoAndJobType = text
            }
  
          } catch (error) {
            console.log(chalk.red('Job salary info unavailable'))
          }
  
          console.log('Getting the role qualifications...')
          try {
            const selector = '[id="qualificationsSection"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.qualificationsSection = text
            }
  
          } catch (error) {
            console.log(chalk.red('Job qualification info unavailable'))
          }
  
          console.log('Getting the job summary...')
          try {
            const selector = '[id="jobDetailsSection"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.jobDetailsSection = text
            }
  
          } catch (error) {
            console.log(chalk.red('Job summary info unavailable'))
          }
  
          console.log('Getting the full job description...')
          try {
            const selector = '[id="jobDescriptionText"]'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerHTML)
              data.jobDescriptionText = text
            }
  
          } catch (error) {
            console.log(chalk.red('Job description info unavailable'))
            await page.screenshot({ path: `jobDescription-indeed-${jobId}.png` })
            data.crawlStatus.push(JSON.stringify(error))

          }
  
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
      const response = await page.goto(`https://www.linkedin.com/jobs/view/${jobId}/`, {
        waitUntil: 'load',
        // Remove the timeout
        timeout: 0
      })

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

        if (data.status === 'open') {

          console.log('Checking for external link...')

          try {
            const selector = '.top-card-layout__cta-container > .sign-up-modal__outlet > .lazy-loaded > #Layer_1 > path'
            const element = await page.waitForSelector(selector, { timeout: 10000 })

            if (element) {
              data.externalSource = 'true'
            }

          } catch (error) {
            console.log(chalk.red('External link unavailable'))
          }
          
          
          console.log('Getting the full job description...')
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
            await page.screenshot({ path: `jobsDescription-linkedin-${jobId}.png` })
            data.crawlStatus.push(JSON.stringify(error))
            console.log(chalk.red('Job description info unavailable'))
          }

          console.log('Getting the work location...')
          try {
            const selector = '.top-card-layout__entity-info-container > .top-card-layout__entity-info > .top-card-layout__second-subline > .topcard__flavor-row > .topcard__flavor:nth-child(2)'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerText)
              data.location = text.trim()
            }
  
          } catch (error) {
            await page.screenshot({ path: `workLocation-linkedin-${jobId}.png` })
            data.crawlStatus.push(JSON.stringify(error))
            console.log(chalk.red('Work location info unavailable'))
          }
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

module.exports = crawlJobPage