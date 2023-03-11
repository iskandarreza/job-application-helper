# Job Application Tracker + Helper

### Motivation:
The last time I was job hunting, I must have sent over 300 applications. It was a pain in the butt. That being said, I didn't optimzie it in anyway, I didn't bother with any keyword matching and I definitely did not write a cover letter. Well maybe I should have. And maybe I should keep track of all those things for analysis. So that's what I'm gonna do.
### The Plan: 
An app that can pull data job posting data from alert emails sent to Gmail, then present the data to the user to take action. Proposed actions include: 
* sumarize the job description
* listing the tech stack
* comparing the user's resume against the full job description
* set the status of the application [pending, expired, rejected, applied, resume viewed, interview set, etc]
* generate a cover letter based on the user's resume and the job description

### Tech to be used:
* React frontend
* Express server
* [OpenAI API](https://platform.openai.com/docs/introduction)
* [JSON Resume](https://jsonresume.org/)
* Google Apps Script

### Progress report:
* Google Apps Script to pull data into a Google Sheet completed
* Google Apps Script to serve pulled data to an API endpoint completed
* React frontend in progress
* Express server backend in progress