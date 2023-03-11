function doGet(e) {
  var sheetName = "Email Links"; // Replace with the name of your sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var range = sheet.getDataRange();
  var data = range.getValues();
  var headers = data.shift();
  
  var params = e.parameter;
  var key = params.key;
  var before = params.before;
  var after = params.after;
  
  var result = [];
  
  if (key) {
    var columnIndex = headers.indexOf("Key");
    for (var i = 0; i < data.length; i++) {
      if (data[i][columnIndex] == key) {
        result.push(data[i]);
      }
    }
  } else if (before) {
    var columnIndex = headers.indexOf("Key");
    for (var i = 0; i < data.length; i++) {
      if (data[i][columnIndex] < before) {
        result.push(data[i]);
      }
    }
  } else if (after) {
    var columnIndex = headers.indexOf("Key");
    for (var i = 0; i < data.length; i++) {
      if (data[i][columnIndex] > after) {
        result.push(data[i]);
      }
    }
  } else {
    result = data;
  }
  
  var output = JSON.stringify(result);
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}
