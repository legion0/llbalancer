"use strict";

const BUNGIE_MANIFEST_VERSION = "84291.20.05.27.1646-1";
// const GIT_BRANCH = `bungie-manifest-version-${BUNGIE_MANIFEST_VERSION}`;
const GIT_BRANCH = "master";

class BungieManifest {
  constructor() {
    this._manifest = JSON.parse(
      UrlFetchApp.fetch(
        `https://raw.githubusercontent.com/legion0/llbalancer/${GIT_BRANCH}/bungie.manifest.json`
      ).getContentText()
    );
  }

  getItemCategories(itemHash) {
    let destinyInventoryItemDefinition = this._manifest
      .DestinyInventoryItemDefinition[itemHash];
    if (destinyInventoryItemDefinition == undefined) {
      throw new Error(
        `Cannot find DestinyInventoryItemDefinition for hash ${itemHash}, try updating the manifest or contact the developer`
      );
    }
    let itemCategoryHashes = destinyInventoryItemDefinition.itemCategoryHashes;
    let shortTitles =
      itemCategoryHashes !== undefined
        ? itemCategoryHashes.map(
            (itemCategoryHash) =>
              this._manifest.DestinyItemCategoryDefinition[itemCategoryHash]
                .shortTitle
          )
        : [];
    return shortTitles;
  }
}

BungieManifest.WeaponCategory = "Weapon";

BungieManifest.WeaponCategories = ["Kinetic", "Energy", "Power"];

BungieManifest.ClassCategories = ["Titan", "Hunter", "Warlock"];

BungieManifest.ArmorCategory = "Armor";

BungieManifest.ArmorCategories = [
  "Helmets",
  "Arms",
  "Chest",
  "Legs",
  "Class Items",
];
