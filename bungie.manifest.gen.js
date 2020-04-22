'use strict';
/*jslint node: true */

import fetch from "node-fetch";
import fs from "fs";

let specs = [{
	'name': 'DestinyInventoryItemDefinition',
	'mapper': function (data) {
		return Object.values(data)
			.map((item) => {
				return {
					'hash': item.hash,
					'itemCategoryHashes': item.itemCategoryHashes,
				};
			})
			.toObject(/*keyFunc=*/item => item.hash);
	},
	'urlSelector': function (manifest) {
		return 'https://www.bungie.net/' + manifest.Response.jsonWorldComponentContentPaths.en.DestinyInventoryItemDefinition;
	}
}, {
	'name': 'DestinyItemCategoryDefinition',
	'mapper': function (data) {
		return Object.values(data)
			.map((itemCategory) => {
				return {
					'hash': itemCategory.hash,
					'grantDestinyClass': itemCategory.grantDestinyClass,
					'shortTitle': itemCategory.shortTitle,
				};
			})
			.toObject(/*keyFunc=*/item => item.hash);
	},
	'urlSelector': function (manifest) {
		return 'https://www.bungie.net/' + manifest.Response.jsonWorldComponentContentPaths.en.DestinyItemCategoryDefinition;
	}
}];

Array.prototype.toObject = function (keyFunc, valFunc) {
	if (keyFunc === undefined) {
		keyFunc = (val, idx) => idx;
	}
	if (valFunc === undefined) {
		valFunc = (val, idx) => val;
	}
	var obj = {};
	var arr = this;
	for (var idx = 0; idx < arr.length; idx++) {
		var item = arr[idx];
		obj[keyFunc(item, idx)] = valFunc(item, idx);
	}
	return obj;
};

fetch('https://www.bungie.net/Platform/Destiny2/Manifest')
	.then(data => data.json())
	.then(json => {
		fs.writeFileSync('bungie.manifest.json.version', json.Response.version);
		return Promise.all(specs.map(spec => fetch(spec.urlSelector(json)).then(response => response.json())));
	}).then(function (responses) {
		// console.log(responses);
		let manifest = responses.reduce(function (o, response, idx) {
			o[specs[idx].name] = specs[idx].mapper(response);
			return o;
		}, {});
		let jsonStr = JSON.stringify(manifest);
		fs.writeFileSync('bungie.manifest.json', jsonStr);
	});
