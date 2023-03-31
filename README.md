# Job Application Tracker + Helper
A little app that connects to an API served out of Google Apps Script to get job post info `[‘url’, ‘org’, ‘role’, ‘location’]` from messages under a specified label from a Gmail account then saves that data in MongoDB, then serves it out of an API from a NodeJs Express server, to be displayed and edited on a React frontend using Material UI X DataGrid. 

It can also scrape extra data from the URL `[‘status’, ‘jobDescriptionText’]` (open/closed, the job description) by using Puppeteer in headless mode, then update the record for that link in the database.

### What it can do right now: 
* through Google Apps Script 
  * it can log into Gmail and read emails under a specified label and scrape data from the email messages with Cheerio on a specific schedule
  * fill that data into Google Sheets
  * serve that data from Google Sheets through an API endpoint with Google Apps Script
* with Express Server
  * act as a proxy to retrieve data from an API and serve that data from the server endpoint
  * connect to a database (MongoDB right now) and process/serve basic CRUD requests through server endpoints
  * run Puppeteer to collect publicly available extra data from the job posting on the source website and then update the record on the database
* with React + Redux
  * present that data using MUI X DataGrid 
  * filter/edit that data, then save it to the connected database in the server backend
  * manually trigger Puppeteer on the Express server to check the open/expired/closed status of the job and update the database
  * send an API call to OpenAI to use the gpt-3.5-turbo model to generate a summary and produce the output in JSON format for consumption by the frontend 
  
### Still in development:
* Host it somewhere where it can run on schedule? Or leave it local and on-demand? 
* comparing the user's resume keywords against the full job description
* generate a cover letter based on the user's resume and the job description
* some pretty charts and/or graphs

### Tech used or to be used:
* Node.js backend
* MongoDB database
* Express server
* React frontend
* Google Apps Script external API source
* Puppeteer for data scraping
* [OpenAI API](https://platform.openai.com/docs/introduction)
* [JSON Resume](https://jsonresume.org/)

### Progress report:
* Google Apps Script to pull data into a Google Sheet completed
* Google Apps Script to serve pulled data to an API endpoint completed
* React frontend serving data using Material UI X DataGrid
* Express server backend serving data from MongoDB Atlas Cloud and Google Apps Script API
* Puppeteer script to collect publicly viewable data from Indeed and/or LinkedIn completed
* ChatGPT for summarizing and formatting the data completed
