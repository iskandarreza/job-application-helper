document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('scrape-data')

  button.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.executeScript(tabs[0].id, { file: 'content.js' }, () => {
        // Script has been injected and executed in the page
        chrome.tabs.sendMessage(tabs[0].id, { message: 'scrape-data' }, (response) => {
          console.log(response.message)
          window.close()
        })
      })
    })
  })
})
