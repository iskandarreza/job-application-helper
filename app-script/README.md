These scripts are to be used in Google Apps Script. There are two components:
* **\`email-data-scraper\`** contains the script that checks the Gmail account for unread mail with a specific label, retrieve the email threads, parse through the message for links that match job posting URLs (for Indeed and LinkedIn) along with other relevant data, then write the data to rows in a Google Sheet
* **\`api\`** contains the script that provides the data to an endpoint for consumption by other the React app (via Express) 
