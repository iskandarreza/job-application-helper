# Job Application Tracker + Helper

### Motivation:
The last time I was job hunting, I must have sent over 300 applications. It was a pain in the butt. That being said, I didn't optimzie it in anyway, I didn't bother with any keyword matching and I definitely did not write a cover letter. Well maybe I should have. And maybe I should keep track of all those things for analysis. So that's what I'm gonna do.

This is a custom app I made so I can learn some things while recording some stats, and leter analyze those stats, while building something and practising some skills. 
  
### What it can do right now: 
* through Google Apps Script 
  * it can log into Gmail and read emails under a specified label and scrape data with Cheerio on a specific schedule
  * fill that data into Google Sheets
  * serve that data from Google Sheet through an API endpoint with Google Apps Script
* with Express Server
  * act as a proxy to retrieve data from an API and serve that data from the server endpoint
  * connect to a database (MongoDB right now) and process/serve basic CRUD requests through server endpoints
* with React + Redux
  * present that data using MUI X DataGrid 
  * filter/edit that data, then save it to the connected database in the server backend
  
### Still in development:
* Do some Puppeteer intergration to turbocharge the scraping mechanism
* Host it somewhere where it can run on schedule? Or leave it local and on demand? 
* comparing the user's resume against the full job description
* generate a cover letter based on the user's resume and the job description

### Tech used or to be used:
* MongoDB
* Express server
* React frontend
* Node.js backend
* [OpenAI API](https://platform.openai.com/docs/introduction)
* [JSON Resume](https://jsonresume.org/)
* Google Apps Script
* Puppeteer

### Progress report:
* Google Apps Script to pull data into a Google Sheet completed
* Google Apps Script to serve pulled data to an API endpoint completed
* React frontend serving data using Material UI X DataGrid
* Express server backend serving data from MongoDB Atlas Cloud and Google Apps Script API