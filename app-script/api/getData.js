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
        var row = {};
        for (var j = 0; j < headers.length; j++) {
          row[headers[j]] = data[i][j];
        }
        result.push(row);
      }
    }
  } else if (before) {
    var columnIndex = headers.indexOf("Key");
    for (var i = 0; i < data.length; i++) {
      if (data[i][columnIndex] < before) {
        var row = {};
        for (var j = 0; j < headers.length; j++) {
          row[headers[j]] = data[i][j];
        }
        result.push(row);
      }
    }
  } else if (after) {
    var columnIndex = headers.indexOf("Key");
    for (var i = 0; i < data.length; i++) {
      if (data[i][columnIndex] > after) {
        var row = {};
        for (var j = 0; j < headers.length; j++) {
          row[headers[j]] = data[i][j];
        }
        result.push(row);
      }
    }
  } else {
    for (var i = 0; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      result.push(row);
    }
  }
  
  var output = JSON.stringify(result);
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}
