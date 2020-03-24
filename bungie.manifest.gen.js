'use strict';
/*jslint node: true */

import fetch from "node-fetch";
import fs from "fs";

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
  // console.log(responses);
  let manifest = responses.reduce(function(o, response, idx) {
    o[specs[idx].name] = specs[idx].mapper(response);
    return o;
	}, {});
	let jsonStr = JSON.stringify(manifest);
	fs.writeFileSync('bungie.manifest.json', jsonStr); 
  // console.log(jsonStr);
});


import { get } from "https";
const url = "https://jsonplaceholder.typicode.com/posts/1";

get(url, res => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", data => {
    body += data;
  });
  res.on("end", () => {
    body = JSON.parse(body);
    console.log(body);
  });
});