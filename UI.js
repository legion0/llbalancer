'use strict';

function onOpen() {
  SpreadsheetApp.getActiveSpreadsheet().addMenu("LLBalancer", [{
    name: "Fetch",
    functionName: "fetchTrigger"
  },{
    name: "GASBungieApi.clearCredentials",
    functionName: "GASBungieApi.clearCredentials"
  }]);
}
