const chalk = require('chalk')


async function linkedInGetRoleLocation(page, data, jobId) {
  console.log('Getting the work location...')
  try {
    const selector = '.top-card-layout__entity-info-container > .top-card-layout__entity-info > .top-card-layout__second-subline > .topcard__flavor-row > .topcard__flavor:nth-child(2)'
    const element = await page.waitForSelector(selector, { timeout: 10000 })

    if (element) {
      const text = await page.$eval(selector, (element) => element.innerText)
      data.location = text.trim()
    }

  } catch (error) {
    await page.screenshot({ path: `screenshots\\workLocation-linkedin-${jobId}.png` })
    data.crawlStatus.push(JSON.stringify(error))
    console.log(chalk.red('Work location info unavailable'))
  }
}

async function linkedInGetDescription(page, data, jobId) {
  console.log('Getting the full job description...')
  try {
    const showMore = '.core-section-container > .core-section-container__content > .description__text > .show-more-less-html > .show-more-less-html__button--more'
    await page.waitForSelector(showMore, { timeout: 10000 })
    await page.click(showMore)

    const selector = '.show-more-less-html__markup'
    const element = await page.waitForSelector(selector, { timeout: 10000 })

    if (element) {
      const text = await page.$eval(selector, (element) => element.innerHTML)
      data.jobDescriptionText = text
    }

  } catch (error) {
    await page.screenshot({ path: `screenshots\\jobsDescription-linkedin-${jobId}.png` })
    data.crawlStatus.push(JSON.stringify(error))
    console.log(chalk.red('Job description info unavailable'))
  }
}

async function linkedInCheckExternalLink(page, data) {
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
}

async function indeedGetDescription(page, data, jobId) {
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
    await page.screenshot({ path: `screenshots\\jobDescription-indeed-${jobId}.png` })
    data.crawlStatus.push(JSON.stringify(error))

  }
}

async function indeedGetSummary(page, data) {
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
}

async function indeedGetQualifications(page, data) {
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
}

async function indeedGetSalaryInfo(page, data) {
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
}

async function indeedGetRoleLocation(page, data) {
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
}

async function indeedGetOrgName(page, data) {
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
}

async function indeedGetRoleTitle(page, data) {
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
}

async function indeedCheckExternalLink(page, data) {
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
}

module.exports = {
  linkedIn: {
    linkedInCheckExternalLink,
    linkedInGetDescription,
    linkedInGetRoleLocation
  },
  indeed: {
    indeedCheckExternalLink,
    indeedGetDescription,
    indeedGetRoleLocation,
    indeedGetOrgName,
    indeedGetRoleTitle,
    indeedGetSalaryInfo,
    indeedGetQualifications,
    indeedGetSummary
  }
}