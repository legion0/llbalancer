'use strict';

class BungieManifest {

  constructor() {
		this._manifest = JSON.parse(UrlFetchApp.fetch('https://raw.githubusercontent.com/legion0/llbalancer/master/bungie.manifest.json').getContentText());
	}
	
	getItemCategories(itemHash) {
    return this._manifest
    .DestinyInventoryItemDefinition[itemHash]
    .itemCategoryHashes
    .map(itemCategoryHash => this._manifest.DestinyItemCategoryDefinition[itemCategoryHash].shortTitle);
	}

}

BungieManifest.WeaponCategory = 'Weapon';

BungieManifest.WeaponCategories = [
  'Kinetic',
  'Energy',
  'Power',
];
  
BungieManifest.ClassCategories = [
  'Titan',
  'Hunter',
  'Warlock',
];

BungieManifest.ArmorCategory = 'Armor';

BungieManifest.ArmorCategories = [
  'Helmets',
  'Arms',
  'Chest',
  'Legs',
  'Class Items',
];
