'use strict';
/* globals OAuth2, BungieManifest, miuri */

class BungieApi {
	constructor(apiKey, accessToken, membershipId) {
		this._apiKey = apiKey;
		this._accessToken = accessToken;
		this._destinyMembershipId = membershipId;
	}

	getProfile() {
		let membershipType = "BungieNext";
		let components = ['ProfileInventories'/*=102*/, 'Characters'/*=200*/, 'CharacterInventories'/*=201*/, 'CharacterEquipment'/*=205*/, 'ItemInstances'/*=300*/];

		let linkedProfiles = this._fetch(
			/*endpoint=*/`/Destiny2/${membershipType}/Profile/${this._destinyMembershipId}/LinkedProfiles`,
			/*queryParams=*/{ getAllMemberships: true }
		);

		let primaryProfile = linkedProfiles.profiles.filter(profile => profile.isCrossSavePrimary).pop() ||
			linkedProfiles.profiles.filter(profile => profile.applicableMembershipTypes).pop() ||
			linkedProfiles.profiles.pop();

		return this._fetch(
			/*endpoint=*/`/Destiny2/${primaryProfile.membershipType}/Profile/${primaryProfile.membershipId}`,
			/*queryParams=*/{ components: components.join(',') }
		);
	}

	_fetch(endpoint, queryParams) {
		let url = new miuri()
			.hostname('www.bungie.net')
			.protocol('https')
			.path('Platform' + endpoint)
			.query(queryParams)
			.toString();
		console.log('BungieApi._fetch', url);

		let headers = { 'X-API-Key': this._apiKey, 'Authorization': 'Bearer ' + this._accessToken };

		return JSON.parse(
			UrlFetchApp.fetch(
				url,
				{
					'headers': headers,
					'muteHttpExceptions': true,
					'contentType': 'application/json'
				}
			).getContentText()
		).Response;
	}
}
