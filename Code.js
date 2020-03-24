'use strict';
/* globals GASBungieApi, BungieManifest */

// TODO: consolidate by class and not character since other character classes can carry relevant items, both armor and weapons


// https://github.com/zhirsch/destinypower/blob/2228a4f8a3528b2bb6f8b231971326f6c2e1bf51/src/web/index.html
// https://github.com/gsuitedevs/apps-script-oauth2
// https://bungie-net.github.io/
// https://developers.google.com/apps-script/guides/services/quotas

kjlib.Prototype.setUp(Array, Object, String);

function fetchTrigger() {
  let api = GASBungieApi.create(SpreadsheetApp.getUi());

  if (api) {
		let manifest = new BungieManifest();
    doFetch(api, manifest);
  }
}

function doFetch(api, manifest) {
  let profile = api.getProfile();

  let allItems = Object.values(profile.characterInventories.data).flatMap(data => data.items)
  .concat(Object.values(profile.characterEquipment.data).flatMap(data => data.items))
  .concat(profile.profileInventory.data.items)
	.filter(item => item.itemInstanceId);
	console.log('allItems.length', allItems.length);

  // inline categories
  allItems.forEach(item => item._itemCategoryShortTitles = manifest.getItemCategories(item.itemHash));

	let weaponItems = allItems.filter(item => item._itemCategoryShortTitles.includes(BungieManifest.WeaponCategory));
	console.log('weaponItems.length', weaponItems.length);
  
  let weapons = BungieManifest.WeaponCategories.map(function(itemCategory) {
    let weaponCategoryItems = weaponItems.filter(item => item._itemCategoryShortTitles.includes(itemCategory));
    return getMaxPrimaryStatItemValue(weaponCategoryItems, profile);
  }).toObject(/*keyFunc=*/(_val, idx) => BungieManifest.WeaponCategories[idx]);
  
  console.log('weapons', weapons);
  
	let armorItems = allItems.filter(item => item._itemCategoryShortTitles.includes(BungieManifest.ArmorCategory));
	console.log('armorItems.length', weaponItems.length);
  
  let armors = BungieManifest.ArmorCategories
  .map(function(armorCategory) {
    let armorCategoryItems = armorItems.filter(item => item._itemCategoryShortTitles.includes(armorCategory));
    return BungieManifest.ClassCategories.map(function(classCategory) {
      let armorClassItems = armorCategoryItems.filter(item => item._itemCategoryShortTitles.includes(classCategory));
      return getMaxPrimaryStatItemValue(armorClassItems, profile);
    })
    .toObject(/*keyFunc=*/(_val, idx) => BungieManifest.ClassCategories[idx]);
  })
  .toObject(/*keyFunc=*/(_val, idx) => BungieManifest.ArmorCategories[idx]);

  console.log('armors', armors);
    
  SpreadsheetApp.getActiveSpreadsheet().toast('Fetch Complete', JSON.stringify([weapons, armors]), 3);

  SpreadsheetApp.getActiveSpreadsheet().getRange("balancer!B2:B4")
  .setValues(BungieManifest.WeaponCategories.map(weaponCategory => [weapons[weaponCategory]]));
  SpreadsheetApp.getActiveSpreadsheet().getRange("balancer!B5:D9")
  .setValues(BungieManifest.ArmorCategories.map(armorCategory => BungieManifest.ClassCategories.map(classCategory => armors[armorCategory][classCategory])));
}

function getItemInstancePrimaryStatValue(itemInstanceId, profile) {
  let itemInstance = profile.itemComponents.instances.data[itemInstanceId];
  return itemInstance.primaryStat ? itemInstance.primaryStat.value : null;
}

function getMaxPrimaryStatItemValue(items, profile) {
  return items
  .map(item => getItemInstancePrimaryStatValue(item.itemInstanceId, profile))
  .filter(value => value != null)
  .sort(kjlib.Sort.orderByKeyFunc(v => v))  // explicit sort to avoid stupid javascript lexigraphical sort.
  .pop();
}
  