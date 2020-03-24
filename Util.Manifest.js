// Run this in jSFiddle or browser console and copy to https://github.com/legion0/Destiny-2-Gear-Level-Calculator
// We need a minified manifest since Google Apps Script UrlFetchApp has a limit of 50MB for the response and some manifest resposnes are >50MB.
// https://developers.google.com/apps-script/guides/services/quotas

/*
let specs = [{
  'name': 'DestinyInventoryItemDefinition',
  'url': 'https://www.bungie.net/common/destiny2_content/json/en/DestinyInventoryItemDefinition-8ec718c3-9556-477e-a454-41713e676fff.json',
  'mapper': function(data) {
    return Object.values(data)
    .map((item) => {
      return {
        'hash': item.hash,
        'itemCategoryHashes': item.itemCategoryHashes,
      };
    })
    .reduce(function(o, item) {
      o[item.hash] = item;
      return o;
    }, {});
  }
}, {
  'name': 'DestinyItemCategoryDefinition',
  'url': 'https://www.bungie.net/common/destiny2_content/json/en/DestinyItemCategoryDefinition-8ec718c3-9556-477e-a454-41713e676fff.json',
  'mapper': function(data) {
    return Object.values(data)
    .map((itemCategory) => {
      return {
        'hash': itemCategory.hash,
        'grantDestinyClass': itemCategory.grantDestinyClass,
        'shortTitle': itemCategory.shortTitle,
      };
    })
    .reduce(function(o, item) {
      o[item.hash] = item;
      return o;
    }, {});
  }
}];

Promise.all(specs.map(spec => fetch(spec.url).then(data => data.json())))
  .then(function (responses) {
  console.log(responses);
  let manifest = responses.reduce(function(o, response, idx) {
    o[specs[idx].name] = specs[idx].mapper(response);
    return o;
  }, {});
  console.log(JSON.stringify(manifest));
});

*/