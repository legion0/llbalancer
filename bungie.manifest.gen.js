'use strict';
/*jslint node: true */

import fetch from "node-fetch";
import fs from "fs";

let specs = [{
  'name': 'DestinyInventoryItemDefinition',
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
  },
	'urlSelector': function(manifest) {
		return 'https://www.bungie.net/' + manifest.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition;
	}
}, {
  'name': 'DestinyItemCategoryDefinition',
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
	},
	'urlSelector': function(manifest) {
		return 'https://www.bungie.net/' + manifest.Response.jsonWorldComponentContentPaths.en.DestinyItemCategoryDefinition;
	}
}];



fetch('https://www.bungie.net/Platform/Destiny2/Manifest')
.then(data => data.json())
.then(json => {
	return Promise.all(specs.map(spec => fetch(spec.urlSelector(json)).then(response => response.json())));
}).then(function (responses) {
  // console.log(responses);
  let manifest = responses.reduce(function(o, response, idx) {
    o[specs[idx].name] = specs[idx].mapper(response);
    return o;
	}, {});
	let jsonStr = JSON.stringify(manifest);
	fs.writeFileSync('bungie.manifest.json', jsonStr); 
  // console.log(jsonStr);
});
