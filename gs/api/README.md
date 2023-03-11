# Publishing the Google Apps Script as a Web App

1. Open the Google Apps Script project in the script editor.
2. Select "Publish" from the menu, then select "Deploy as web app".
3. Set the following options:
    - Project version: New
    - Execute the app as: Me
    - Who has access to the app: Anyone, even anonymous
4. Click "Deploy".
5. When prompted, review and accept the permissions required by the script.
6. Copy the URL of the web app endpoint that is displayed.

# Fetching Data from the API Endpoint

To fetch data from the API endpoint, use the URL of the web app endpoint that you copied in the previous step. Append the query parameters to the URL as needed.

## Fetch All Rows

To fetch all rows from the "Email Links" sheet, use the following URL:
```
https://script.google.com/macros/s/<your-web-app-url>/exec
```
Replace `<your-web-app-url>` with the URL of the web app endpoint that you copied in the previous step.

## Fetch Rows with a Specific Key

To fetch rows with a value in the "Key" column that matches a specific key, use the following URL:
```
https://script.google.com/macros/s/<your-web-app-url>/exec?key=<key>
```
Replace `<your-web-app-url>` with the URL of the web app endpoint that you copied in the previous step, and replace `<key>` with the value that you want to search for.

## Fetch Rows Before a Specific Key

To fetch rows with a value in the "Key" column that is less than a specific value, use the following URL:

```
https://script.google.com/macros/s/<your-web-app-url>/exec?before=<before>
```
Replace `<your-web-app-url>` with the URL of the web app endpoint that you copied in the previous step, and replace `<before>` with the value that you want to search for.

## Fetch Rows After a Specific Key

To fetch rows with a value in the "Key" column that is greater than a specific value, use the following URL:

```
https://script.google.com/macros/s/<your-web-app-url>/exec?after=<after>
```
Replace `<your-web-app-url>` with the URL of the web app endpoint that you copied in the previous step, and replace `<after>` with the value that you want to search for.
