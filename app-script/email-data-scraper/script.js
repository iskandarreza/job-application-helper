const labelNames = ["Jobs/LinkedIn Job Alert", "Jobs/Indeed"]
const ss = SpreadsheetApp.getActiveSpreadsheet()
const sheet = ss.getSheetByName("Email Links")

function startCrawlerScraper() {
  // Call the checkEmailAndFillSheet function
  checkEmailAndFillSheet()
}

/**
 * Gets all the unread emails in a Gmail label or folder that were received in the last three days
 * and have "is hiring" in the subject line, finds all the links in the emails, and saves the links to
 * a Google Sheet.
 */
function checkEmailAndFillSheet() {
  var date = new Date()
  date.setDate(date.getDate() - 3)
  var dateString = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd')

  var threads = []

  for (var i = 0; i < labelNames.length; i++) {
    var label = labelNames[i]
    var labelThreads = GmailApp.search('label:' + label + ' after:' + dateString + ' is:unread', 0, 500)
    threads = threads.concat(labelThreads)
  }

  var links = getLinksFromThreads(threads)

  if (hasLinks(links)) {
    fillSheet(links)
  }
}


/**
 * If the number of keys in the links object is greater than 0, return true. Otherwise, return false
 * @param links - The links object that you want to check.
 * @returns a boolean value.
 */
function hasLinks(links) {
  return Object.keys(links).length > 0
}

/**
 * It takes an object of key/url pairs, checks if the url is already in the sheet, and if not, adds it
 * @param links - This is the object that contains the key and url.
 */
function fillSheet(links) {

  if (sheet == null) {
    sheet = ss.insertSheet("Email Links")
    sheet.appendRow(["Key", "URL"])
  }

  var existingData = sheet.getDataRange().getValues().slice(1)
  var existingUrls = existingData.map(function (row) {
    return row[1]
  })
  var existingKeys = existingData.map(function (row) {
    return row[0]
  })

  var rowsToAdd = []
  for (var key in links) {
    var url = links[key].url
    var key = links[key].key
    var companyName = links[url].companyName
    var role = links[url].role
    var location = links[url].location
    if (existingUrls.indexOf(url) == -1 && existingKeys.indexOf(key) == -1) {
      rowsToAdd.push([key, url, companyName, role, location, '', ''])
    }
  }
  if (rowsToAdd.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, 7).setValues(rowsToAdd)
  }
}


/**
 * It loops through all the threads in the inbox, and for each thread, it loops through all the
 * messages in the thread. For each message, it loops through all the links in the message, and if the
 * link is from LinkedIn or Indeed, it extracts the job information from the link and adds it to the
 * links object
 * @param threads - an array of GmailThread objects
 * @returns An object with the following properties:
 */
function getLinksFromThreads(threads) {
  const getSubject = (thread) => thread.getFirstMessageSubject()
  var links = {}
  for (var i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages()
    for (var j = 0; j < messages.length; j++) {
      const message = messages[j]
      const subject = getSubject(threads[i])
      Logger.log({ subject })

      // TODO: separate functions for LinkedIn and Indeed
      // TODO: have each "crawl query" in it's own function
      var body = message.getBody()
      var $ = Cheerio.load(body)

      var similarJobs
      const isViewed = subject.includes('Your application for')


      if (isViewed) {

        $('tr').each(function (index, element) {
          const textContent = $(element).text().toString()
          if (textContent.includes('Similar jobs')) {
            const targetElement = $(element).next()
            const linkNodes = $(targetElement).find('a')

            linkNodes.each((index, aTag) => {
              const linkWithoutQueryString = $(aTag).attr('href')?.split('?')[0]

              if (linkWithoutQueryString.includes('/jobs/view')) {
                const key = linkWithoutQueryString.match(/\/(\d+)\/?$/)[1]
                const role = $(aTag).find('span').text().trim()
                const companyName = $(aTag).find('p').text().split('·')[0].trim()
                const location = $(aTag).find('p').text().split('·')[1].trim()

                createDataObject(links, linkWithoutQueryString, key, companyName, role, location)

                Logger.log(links[linkWithoutQueryString])

              }

            })


          }
        })

      } else (

        $('a').each(function () {
          var self = $(this)
          var link = self.attr('href')

          if (link != null) {
            // Check if the link is from LinkedIn or Indeed.
            var linkWithoutQueryString = link.split('?')[0]
            var isLinkedIn = linkWithoutQueryString.includes('linkedin.com')
            var isIndeed = linkWithoutQueryString.includes('indeed.com/rc/clk/dl')

            if (isLinkedIn && linkWithoutQueryString.includes('/jobs/view')) {
              var key = linkWithoutQueryString.match(/\/(\d+)\/?$/)[1]
              if (!links.hasOwnProperty(linkWithoutQueryString)) {
                const isHiring = subject.includes('Now hiring') || subject.includes('is hiring:')
                const isNewJobs = /\d+\s+new\s+job(s)?\s+for/.test(subject)

                if (isHiring || isNewJobs) {
                  var entry = $(this).closest('table[role="presentation"]').first()
                  var role = entry.find('a').first().text().trim()
                  if (role) {
                    var companyName = entry.find('p').eq(0).text().split('·')[0].trim()
                    var role = entry.find('a').first().text().trim()
                    var location = entry.find('p').eq(0).text().split('·')[1].trim()
                    createDataObject(links, linkWithoutQueryString, key, companyName, role, location)
                  }
                } else if (subject.includes('your application was sent')) {

                  if (!similarJobs) {
                    similarJobs = $('p:contains("similar jobs")').closest('tr').nextAll()

                    similarJobs.each((index, item) => {
                      const role = $(item).find('tbody tr td a table').text().split('    ')[0].trim()
                      const companyName = $(item).find('tbody tr td a table').text().split('    ')[1].split(' · ')[0].trim()
                      const location = $(item).find('tbody tr td a table').text().split('    ')[1].split(' · ')[1].trim()

                      createDataObject(links, linkWithoutQueryString, key, companyName, role, location)

                      Logger.log(links[linkWithoutQueryString])
                    })

                  }

                }
              }

            } else if (isIndeed) {
              var key = link.match(/jk=([^&]*)/i)
              if (key != null) {
                key = key[0].split("=")[1]
                var linkWithoutQueryString = "https://www.indeed.com/viewjob?jk=" + key

                if (!links.hasOwnProperty(linkWithoutQueryString)) {

                  var entry = $(this).find('tbody')
                  var companyName = entry.find('tr').eq(1).text().split('-')[0].trim()
                  var role = entry.find('tr').eq(0).text().split('-')[0].trim()
                  var location = entry.find('tr').eq(1).next().text()

                  createDataObject(links, linkWithoutQueryString, key, companyName, role, location)
                  Logger.log(links[linkWithoutQueryString])
                }
              }
            }

          }

        })

      )

      message.markRead()
    }
  }

  return links
}

/**
 * It takes in a link, removes the query string, and then creates a data object with the link, key,
 * company name, role, and location.
 * @param links - the object that will contain all the data
 * @param linkWithoutQueryString - The URL without the query string
 * @param key - the key of the object
 * @param companyName - The name of the company
 * @param role - the role of the job
 * @param location - The location of the job posting
 */
function createDataObject(links, linkWithoutQueryString, key, companyName, role, location) {
  links[linkWithoutQueryString] = {
    'url': linkWithoutQueryString,
    'key': key,
    'companyName': companyName,
    'role': role,
    'location': location,
  }
}
