document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('scrape-data')

  button.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentUrl = tabs[0].url;
      const targetUrl = 'https://myjobs.indeed.com/applied';
      if (currentUrl.startsWith(targetUrl)) {
        await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
        chrome.tabs.sendMessage(tabs[0].id, { message: 'scrape-data' }, (response) => {
          console.log(response.message)
          window.close()
        });
      } else {
        alert('This extension can only be used on the "https://myjobs.indeed.com/applied" page.')
      }
    })
  })
})
