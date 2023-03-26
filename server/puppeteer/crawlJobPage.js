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
const crawlJobPage = async (jobId, hostdomain) => {
  console.log('')
  console.log(`Received status request for job ID: ${jobId} for ${hostdomain}`)

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  const userAgentString = new userAgent({ deviceCategory: 'desktop' }).toString();
  await page.setUserAgent(userAgentString);

  const data = {}
  let status = 'open'
  let redirected = false
  data.redirected = false
  data.externalSource = false
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
      if (pageTitle.includes('Page Not Found')) {
        redirected = true
      }
      
      if (!redirected) {

        console.log('Checking if job is stil open...')
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

          data.status = 'closed'
          data.crawlStatus = JSON.stringify(error)
        }

        if (data.status === 'open') {
         
          console.log('Checking for external link...')

          try {
            const selector = '#viewJobButtonLinkContainer > #applyButtonLinkContainer'
            const element = await page.waitForSelector(selector, { timeout: 10000 })
            
            if (element) {
              const text = await page.$eval(selector, (element) => element.innerText)
              
              if (text.includes('Apply on company site')) {
                data.externalSource = true
              }
            }
  
          } catch (error) {
            console.log('Job title info unavailable')
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
            console.log('Job title info unavailable')
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
            console.log('Organization info unavailable')
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
            console.log('Job location info unavailable')
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
            console.log('Job salary info unavailable')
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
            console.log('Job qualification info unavailable')
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
            console.log('Job summary info unavailable')
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
            console.log('Job description info unavailable')
          }
  
        }
        
      } else {
        status = 'closed'
        data.status = 'closed'
      }
      console.log(`job ID ${jobId} at indeed ${status}`)
      return {
        success: data
      }
    } else if (hostdomain === `linkedin`) {
      console.log(`Navigating to https://www.linkedin.com/jobs/view/${jobId}/`)
      await page.goto(`https://www.linkedin.com/jobs/view/${jobId}/`)

      if (!redirected) {

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

          data.status = 'open'
          data.crawlStatus = JSON.stringify(error)
        }

        if (data.status === 'open') {

          // ('.top-card-layout__cta-container > .sign-up-modal__outlet > .lazy-loaded > #Layer_1 > path')
          console.log('Checking for external link...')

          try {
            const selector = '.top-card-layout__cta-container > .sign-up-modal__outlet > .lazy-loaded > #Layer_1 > path'
            const element = await page.waitForSelector(selector, { timeout: 10000 })

            if (element) {
              // const text = await page.$eval(selector, (element) => element.innerText)

              // if (text.includes('Apply on company site')) {
                data.externalSource = true
              // }
            }

          } catch (error) {
            console.log('Job title info unavailable')
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
            await page.screenshot({ path: `screenshot-linkedin-${jobId}.png` })
            data.crawlStatus = JSON.stringify(error)
            console.log('Job description info unavailable')
          }
        }
        
        
      } else {
        status = 'closed'
        data.status = 'closed'
      }
      console.log(`job ID ${jobId} at linkedin ${status}`)
      return {
        success: data
      }
    }
  } catch (error) {
    console.log(`Error processing ${hostdomain} job id ${jobId}`)
    console.error(error)
    return {
      error: error
    }
  } finally {
  await browser.close()
  }
}

module.exports = crawlJobPage