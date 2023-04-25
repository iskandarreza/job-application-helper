const getApplicantCountData = () => {
  let data = []
  document.querySelectorAll('.atw-JobMetadata-content span').forEach((elem) => {
    if (elem.textContent.includes('Around')) {
      data.push({
        id: elem.closest('[data-id]').dataset.id,
        applicants: elem.textContent.match(/\d+/g)[1]
      })
    }
  })

  return data
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'scrape-data') {
    const data = getApplicantCountData()

    fetch('http://localhost:5030/logging/indeed-applicant-count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(() => {
      sendResponse({ message: 'Data saved successfully.' })
    })
    .catch((error) => {
      console.error(error)
      sendResponse({ message: 'Error saving data.' })
    })

    return true
  }
})
