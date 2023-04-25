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
* with MongdDB aggregate queries using `react-wordcloud` or `react-chartjs-2`
  * display a word cloud or bar chart of the top skills employers are looking for 
  
### Still in development:
* comparing the user's resume keywords against the full job description
* generate a cover letter based on the user's resume and the job description

### Tech used or to be used:
* Node.js backend
* MongoDB database
* Express server
* React frontend
* Google Apps Script external API source
* Puppeteer for data scraping
* [OpenAI API](https://platform.openai.com/docs/introduction)
* [JSON Resume](https://jsonresume.org/)
* ChartJS and ReactWordCloud for data visualization

### Progress report:
* Google Apps Script to pull data into a Google Sheet completed
* Google Apps Script to serve pulled data to an API endpoint completed
* React frontend serving data using Material UI X DataGrid
* Express server backend serving data from MongoDB Atlas Cloud and Google Apps Script API
* Puppeteer script to collect publicly viewable data from Indeed and/or LinkedIn completed
* ChatGPT for summarizing and formatting the data completed
* Demo [deployed](https://job-application-helper-js6l.onrender.com/)
* Data visualization with ChartJS and ReactWordcloud 

## How to deploy on your machine
### Pre-setup
1. Subscribe to job alert emails on Indeed and/or LinkedIn to a Gmail account
2. Filter those alert emails in Gmail so that it can be organized into folders/labels

### Setup
1. Set up Google Sheets + Google Apps Script to pull data from the alert emails and serve it out an API endpoint. Refer to this [README.md](https://github.com/iskandarreza/job-post-email-data/blob/main/README.MD) for details. You may need to customize [`app-script/api/getData.js`](https://github.com/iskandarreza/job-application-helper/blob/main/app-script/api/getData.js) and [`app-script/email-data-scraper/script.js`](https://github.com/iskandarreza/job-application-helper/blob/main/app-script/email-data-scraper/script.js) to match your configuration*
2. Set up a mongoDB database either locally or on mongodb.com
3. Create and [OpenAI API key](https://platform.openai.com/account/api-keys)
4. Add a `.env` file to the `client` folder and a `config.env` file to the `server` folder
```
# client/.env
PORT=3030
REACT_APP_SERVER_URI=http://localhost:5030
REACT_APP_WEBSOCKET_URI=ws://localhost:5030

# server/config.env
OPENAI_API_KEY=<YOUR-OPENAI-API-KEY>
API_DATA_SOURCE=<GOOGLE-APPS-SCRIPT-URL>
ATLAS_URI=<MONGODB-CONNECTION-STRING>
DB_NAME=<MONGO-DB-DATABASE-NAME>
PORT=5030
CLIENT_URI=http://localhost:3030
SERVER_URI=http://localhost:5030
```
4. Install dependencies for the frontend client
```bash
$ cd client
$ yarn
```
5. Install dependencies for the backend server
```bash
$ cd server
$ yarn
```
6. Start the server and the client
```bash
$ cd server
$ yarn start
```
```bash
$ cd client
$ yarn start
```
7. This last step only needs to run once on first start or deploy, or if you made changes to `client/src/worker.js`
```bash
$ cd client
$ yarn compile
```

*The email templates sent by LinkedIn in different countries are not identical. What I have here is for US based LinkedIn job alerts. Apparently they are not the same with Australian LinkedIn, so this `script.js` will not work as-is with that.
