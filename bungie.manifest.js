'use strict';

const BUNGIE_MANIFEST_VERSION = '84291.20.05.27.1646-1';
// const GIT_BRANCH = `bungie-manifest-version-${BUNGIE_MANIFEST_VERSION}`;
const GIT_BRANCH = 'master';

class BungieManifest {

  constructor() {
		this._manifest = JSON.parse(UrlFetchApp.fetch(`https://raw.githubusercontent.com/legion0/llbalancer/${GIT_BRANCH}/bungie.manifest.json`).getContentText());
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
