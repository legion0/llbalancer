'use strict';

class SettingsTable extends kjlib.Table {
  constructor() {
    super(SettingsTable.kSheetName, SettingsTable.kSheetFields, /*mutable=*/ false);
    
    this._settings = {};
    for (var i = 0; i < this.getNumRows(); i++) {
      var row = this.getRow(i);
      this._settings[row.name] = row.value;
    }
  }
  
  getSetting(name) {
    return this._settings[name];
  }
  
}

SettingsTable.kSheetName = 'settings';
SettingsTable.kSheetFields = ['name', 'value', 'description'];

var _settingsTable = null;
function getSettingsTable() {
  if (_settingsTable == null) {
    _settingsTable = new SettingsTable();
  }
  return _settingsTable;
}

function test_SettingsTable() {
  var table = new SettingsTable();
  Logger.log(table.getNumRows());
  Logger.log(table.getSetting('run_interval'));
}
