'use strict';

function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu("LLBalancer", [{
    name: "Fetch",
    functionName: "fetchTrigger"
  }]);
}
