'use strict';
/* globals getSettingsTable, BungieApi, kClassCategories, kArmorCategories, kWeaponCategories */

// TODO: consolidate by class and not character since other character classes can carry relevant items, both armor and weapons


// https://github.com/zhirsch/destinypower/blob/2228a4f8a3528b2bb6f8b231971326f6c2e1bf51/src/web/index.html
// https://github.com/gsuitedevs/apps-script-oauth2
// https://bungie-net.github.io/
// https://developers.google.com/apps-script/guides/services/quotas

kjlib.Prototype.setUp(Array, Object, String);

let kApiKey = null;
function getApiKey() {
  if (kApiKey == null) {
    kApiKey = getSettingsTable().getSetting('apiKey');
  }
  return kApiKey;
}

function fetchTrigger() {
  if (Session.getActiveUser().getEmail() != 'phenixdoc@gmail.com' && getApiKey() == '13a9b83b404945f2b4aa7854c122381c') {
    let redirectUrl = 'https://script.google.com/macros/d/' + ScriptApp.getScriptId() + '/usercallback';
    let msg = `You need to create your own api key.
      See settings tab for instructions link.
      This is required since you will have a different redirect url from me.
      Your redirect url is: ${redirectUrl}`;
    SpreadsheetApp.getUi().alert(msg);
    return;
  }
  
  let oAuthClientId = getSettingsTable().getSetting('oAuthClientId');
  let oAuthClientSecret = getSettingsTable().getSetting('oAuthClientSecret');

  let api = new BungieApi(oAuthClientId, oAuthClientSecret);

  console.log(api.service.hasAccess());
  if (!api.service.hasAccess()) {
    showSidebar(api.service);
  } else {
    doFetch(api);
  }
}

function doFetch(api) {
  let profile = api.getProfile();

  let allItems = Object.values(profile.characterInventories.data).flatMap(data => data.items)
  .concat(Object.values(profile.characterEquipment.data).flatMap(data => data.items))
  .concat(profile.profileInventory.data.items)
  .filter(item => item.itemInstanceId);

  // inline categories
  allItems.forEach(item => item._itemCategoryShortTitles = api.getItemCategories(item.itemHash));

  let weaponItems = allItems.filter(item => item._itemCategoryShortTitles.includes('Weapon'));
  
  let weapons = kWeaponCategories.map(function(itemCategory) {
    let weaponCategoryItems = weaponItems.filter(item => item._itemCategoryShortTitles.includes(itemCategory));
    return getMaxPrimaryStatItemValue(weaponCategoryItems, profile);
  }).toObject(/*keyFunc=*/(val, idx) => kWeaponCategories[idx]);
  
  console.log('weapons', weapons);
  
  let armorItems = allItems.filter(item => item._itemCategoryShortTitles.includes('Armor'));
  
  let armors = kArmorCategories
  .map(function(armorCategory) {
    let armorCategoryItems = armorItems.filter(item => item._itemCategoryShortTitles.includes(armorCategory));
    return kClassCategories.map(function(classCategory) {
      let armorClassItems = armorCategoryItems.filter(item => item._itemCategoryShortTitles.includes(classCategory));
      return getMaxPrimaryStatItemValue(armorClassItems, profile);
    })
    .toObject(/*keyFunc=*/(val, idx) => kClassCategories[idx]);
  })
  .toObject(/*keyFunc=*/(val, idx) => kArmorCategories[idx]);

  console.log('armors', armors);
  //    
  //    let armors = [];
  //    ARMOR_ORDER.forEach(function(bucketHash, idx) {
  //      
  //      
  //      let itemInstance = allItems.filter(item => item.bucketHash == bucketHash)
  //      .map(item => profile.itemComponents.instances.data[item.itemInstanceId])
  //      .sort(orderByKeyFunc(itemInstance => itemInstance.primaryStat.value))
  //      .pop();
  ////      console.log('itemInstance', itemInstance);
  //      armors.push(itemInstance.primaryStat.value);
  //    });
  //    console.log('armors', armors);
  
  SpreadsheetApp.getActiveSpreadsheet().toast('Fetch Complete', JSON.stringify([weapons, armors]), 3);

  SpreadsheetApp.getActiveSpreadsheet().getRange("balancer!B2:B4")
  .setValues(kWeaponCategories.map(weaponCategory => [weapons[weaponCategory]]));
  SpreadsheetApp.getActiveSpreadsheet().getRange("balancer!B5:D9")
  .setValues(kArmorCategories.map(armorCategory => kClassCategories.map(classCategory => armors[armorCategory][classCategory])));
}


function showSidebar(service) {
  let authorizationUrl = service.getAuthorizationUrl();
  let template = HtmlService.createTemplate(
    '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
    'Reopen the sidebar when the authorization is complete.');
  template.authorizationUrl = authorizationUrl;
  let page = template.evaluate();
  SpreadsheetApp.getUi().showSidebar(page);
}

function authCallback(request) {
  let oAuthClientId = getSettingsTable().getSetting('oAuthClientId');
  let oAuthClientSecret = getSettingsTable().getSetting('oAuthClientSecret');

  let api = new BungieApi(oAuthClientId, oAuthClientSecret);

  let service = api.service;

  var isAuthorized = service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
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
  