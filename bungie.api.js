'use strict';
/* globals getApiKey */

const kDestinyClassNames = {
  0: 'Titan',
  1: 'Hunter',
  2: 'Warlock',
  3: 'Unknown',
};

const kWeaponCategories = [
  'Kinetic',
  'Energy',
  'Power',
];
  
const kClassCategories = [
  'Titan',
  'Hunter',
  'Warlock',
];

const kArmorCategories = [
  'Helmets',
  'Arms',
  'Chest',
  'Legs',
  'Class Items',
];


class BungieApi {
  constructor(oAuthClientId, oAuthClientSecret) {
    this.service = createBungieService(oAuthClientId, oAuthClientSecret);
    if (this.service.hasAccess()) {
      this._accessToken = this.service.getAccessToken();
      this._manifest = JSON.parse(UrlFetchApp.fetch('https://raw.githubusercontent.com/legion0/Destiny-2-Gear-Level-Calculator/master/bungie.manifest.json').getContentText());
      this._destinyMembershipId = this.service.getToken().membership_id;
    }
  }
  
  getProfile() {
    let components = ['ProfileInventories'/*=102*/, 'Characters'/*=200*/, 'CharacterInventories'/*=201*/, 'CharacterEquipment'/*=205*/, 'ItemInstances'/*=300*/];
    let membershipType = "BungieNext";
    let linkedProfiles = bungieApiFetch(this._accessToken, '/Destiny2/' + membershipType + '/Profile/' + this._destinyMembershipId + '/LinkedProfiles', {getAllMemberships: true});

    let primaryProfile = linkedProfiles.profiles.filter(profile => profile.isCrossSavePrimary).pop() ||
      linkedProfiles.profiles.filter(profile => profile.applicableMembershipTypes).pop() ||
      linkedProfiles.profiles.pop();

    return bungieApiFetch(this._accessToken, '/Destiny2/' + primaryProfile.membershipType + '/Profile/' + primaryProfile.membershipId, {components: components.join(',')});
  }

  getItemCategories(itemHash) {
    return this._manifest
    .DestinyInventoryItemDefinition[itemHash]
    .itemCategoryHashes
    .map(itemCategoryHash => this._manifest.DestinyItemCategoryDefinition[itemCategoryHash].shortTitle);
  }
}

function buildQueryParams(data) {
   const params = [];
   for (var d in data)
      params.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return  params.join('&');
}

function bungieApiFetch(accessToken, endpoint, queryParams) {
  let apiKey = getApiKey();
  let url = 'https://www.bungie.net/Platform' + endpoint;
  if (queryParams) {
    url += '?' + buildQueryParams(queryParams);
  }
  let headers = { 'X-API-Key': apiKey, 'Authorization': 'Bearer ' + accessToken };
  console.log('bungieApiFetch', url);
  
  return JSON.parse(UrlFetchApp.fetch(url, { 'headers': headers, 'muteHttpExceptions': true, 'contentType': 'application/json' }).getContentText()).Response;
}

//function bungieResourceFetch(resource) {
//  let apiKey = getApiKey();
//  let url = 'https://www.bungie.net' + resource;
//  let headers = { 'X-API-Key': apiKey, 'Content-Type': 'application/json' };
//  console.log(url, headers);
//
//  let response = UrlFetchApp.fetch(url, { 'headers': headers, 'muteHttpExceptions': true, 'contentType': 'application/json' });
//  let byteContent = response.getContent();
//
//  let contentText = response.getContentText();
//  
//  let json = JSON.parse(contentText);
//  return json.Response;
//}

function createBungieService(oAuthClientId, oAuthClientSecret) {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.

  return OAuth2.createService('bungie')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl("https://www.bungie.net/en/oauth/authorize")
      .setTokenUrl('https://www.bungie.net/platform/app/oauth/token/')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(oAuthClientId)
      .setClientSecret(oAuthClientSecret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      // https://script.google.com/macros/d/1jFSDci_ws9683aSFIUClcKw6Z_CP_Wci8F_lh2JJgwocbSpqlVZZvYAm/usercallback
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())
      .setCache(CacheService.getUserCache())

      // Set the scopes to request (space-separated for Google services).
      // .setScope('https://www.googleapis.com/auth/drive')

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      // .setParam('login_hint', Session.getEffectiveUser().getEmail())

      // Requests offline access.
      // .setParam('access_type', 'offline')

      // Consent prompt is required to ensure a refresh token is always
      // returned when requesting offline access.
      // .setParam('prompt', 'consent');
  
  .setParam('response_type', 'code');
}
