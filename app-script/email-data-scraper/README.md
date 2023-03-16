# LinkedIn/Indeed Job Alert Email Scraper
This script scrapes LinkedIn and Indeed job alert emails sent to your Gmail for data on the company, position, and location, plus the URL of the job posting, and writes it to a Google Sheet.

## Setup
1. Create a new Google Sheet and name it "Email Links".
2. In the "Email Links" sheet, create columns "Key", "URL", "Company", "Position", "Location", and "Posting".
3. Open the script editor by selecting **\`Extension** > **Apps Script\`**.
4. Copy and paste the code from the **\`script.js\`** file into the script editor (`**Code.gs**`).
5. Save the script.
6. Click on `**Run**`.
7. It will ask for permission authorization. Click on `**Review Permissions**`
8. A window will pop up, choose your Google Account
9. A security warning will pop up, click on `**Advanced**` then `**Go to Untitled project (unsafe)**`
That's it!

## Usage

### To manually run the script: 
1. In the script editor, select the **\`start()\`** function then click the "Run" button.
2. Wait for the script to finish running. You should see log messages in the console indicating the progress of the script.
3. Once the script is finished, the data from the job postings will be written to the "Email Links" sheet.

### To have it run automatically:
1. Open the Google Sheets file that contains the script you want to trigger.
2. In the script editor, click on the "Triggers" icon (the clock) in the toolbar.
3. Click the "Add Trigger" button in the bottom right corner of the "Triggers" dialog.
4. Select the following trigger settings:
    1. Choose which function to run: **\`start\`**
    2. Choose which deployment should run: **\`Head\`**
    3. Select event source: **\`Time-driven\`**
    4. Select type of time based trigger: **\`Hours timer\`**
    5. Select hours interval: **\`Every 4 hours\`**
5. Click the "Save" button to save the trigger.


That's it! The **\`start()\`** function will now be automatically run every 4 hours. You can modify the trigger settings or delete the trigger altogether by going back to the "Triggers" dialog in the script editor.

If you have any issues or questions, feel free to reach out.
