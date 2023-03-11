const labelNames = ["Jobs/LinkedIn Job Alert", "Jobs/Indeed"]

function start() {
  // Call the checkEmailAndFillSheet function
  checkEmailAndFillSheet()

  // Call the addLinkData function
  addLinkData()
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
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName("Email Links")
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
    var posting = links[url].posting
    var originalUrl = 'https://www.indeed.com/rc/clk/dl?jk=' + key
    if (existingUrls.indexOf(url) == -1 && existingKeys.indexOf(key) == -1) {
      if (url.includes("indeed")) {
        rowsToAdd.push([key, url, companyName, role, location, posting, originalUrl])
      } else {
        rowsToAdd.push([key, url, companyName, role, location, '', ''])
      }

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
      var body = message.getBody()
      var $ = Cheerio.load(body)

      var similarJobs

      $('a').each(function () {
        var link = $(this).attr('href')

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
                var posting = entry.find('tr').last().prev().text()

                createDataObject(links, linkWithoutQueryString, key, companyName, role, location)
                links[linkWithoutQueryString].posting = posting
              }
            }
          }
        }

      })


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
    'location': location
  }
}

/**
 * It gets all the URLs from the "Email Links" sheet, navigates to each URL, and gets the job
 * description
 * @returns An object with the URL as the key and the job description as the value.
 */
function getLinkData() {
  // Get all the URLs from the "Email Links" sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName("Email Links")
  const data = sheet.getDataRange().getValues()

  if (sheet == null) {
    sheet = ss.insertSheet("Email Links")
    sheet.appendRow(["Key, URL", "Company Name", "Role", "Location", "Posting"])
  }

  // Check if the sheet has any rows.
  const numRows = sheet.getDataRange().getNumRows()
  if (numRows == 0) {
    sheet.appendRow(["Key, URL", "Company Name", "Role", "Location", "Posting"])
  }

  // Create an empty object to store the link data.
  var linkData = {}

  // Loop through each row in the sheet.
  for (var i = 1; i < data.length; i++) {
    //Logger.log(data[i][5])
    const url = data[i][1]
    const jobDesc = data[i][5]

    // Check if the link already exists in the link data object. If it does, skip it.
    if (url in linkData) {
      Logger.log(`link ${url} already added, continuing to the next item`)
      continue
    }

    // Check if the link data already inserted. If it does, skip it.
    if (jobDesc) {
      Logger.log(`data for ${url} already added, continuing to the next item`)
      continue
    }

    if (url.includes("linkedin.com")) {
      // Navigate to the link and get the response.
      const response = navigateToLink(url)

      // If there is an error retrieving the page title, that means the link has expired. Remove it from the list.
      if (response == null || response.getResponseCode() != 200) {
        continue
      }

      const content = response.getContentText()
      const $ = Cheerio.load(content)

      var posting = $('.show-more-less-html__markup').first().html()

      // Add the link data to the link data object.
      linkData[url] = {
        posting: posting
      }

    } else if (url.includes('indeed.com')) {
      // TODO: use a Puppeteer webpack bundle with GAS (medium difficulty)
      //const response = navigateToLink(url)

      //const content = response.getContentText()
      //const $ = Cheerio.load(content)

      //Logger.log(content)

      // var posting = $
    }

  }

  return linkData
}

/**
 * Navigate to the specified URL and return the response.
 * @param {string} url - The URL to navigate to.
 * @returns {HTTPResponse} The response from the URL.
 */
function navigateToLink(url) {
  var response = null
  var retries = 0
  while (retries < 5) {
    try {
      response = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          "accept-language": "en-US,en;q=0.9"
        },
        followRedirects: true
      })
      if (response.getResponseCode() == 429 || response.getResponseCode() == 999) {
        // Throttle the requests.
        Logger.log("Throttled...", response.getContentText)
        Utilities.sleep(1000 * 60 * 5)
        retries++
      } else {
        // Break out of the loop if the request was successful.
        break
      }
    } catch (e) {
      Logger.log("Error fetching URL: " + url)
      Logger.log(e)
      // Throttle the requests.
      Utilities.sleep(1000 * 60 * 5)
      retries++
    }
  }
  return response
}

/**
* It loops through each row in the "Email Links" sheet, gets the URL in column B, and checks if the
* URL exists in the link data object. If it does, it writes the data to the row.
*/
function addLinkData() {
  // Get the link data object.
  var linkData = getLinkData()

  // Get the "Email Links" sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName("Email Links")

  // Loop through each row in the sheet.
  var numRows = sheet.getDataRange().getNumRows()
  for (var i = 1; i <= numRows; i++) {
    var key = sheet.getRange(i, 1).getValue()
    var url = sheet.getRange(i, 2).getValue()

    // Check if the URL exists in the link data object.
    if (url in linkData) {
      var rowData = [
        key,
        url,
        sheet.getRange(i, 3).getValue(),
        sheet.getRange(i, 4).getValue(),
        sheet.getRange(i, 5).getValue(),
        linkData[url].posting,
        sheet.getRange(i, 7).getValue()
      ]

      sheet.getRange(i, 1, 1, 7).setValues([rowData])
    }
  }
}
