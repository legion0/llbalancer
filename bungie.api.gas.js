'use strict';
/* globals BungieApi, Oauth2 */

// requires: https://github.com/gsuitedevs/apps-script-oauth2

class GASBungieApi {
	/*
	* Create a new BungieApi by querying the user for relevant data nad storing it in properties service, this method also handles Oauth authentication.
	* @param {Ui} ui The ui to use when querying the user for information.
	*/
	static create(ui) {
		let propertyStore = PropertiesService.getUserProperties();

		let apiKey = propertyStore.getProperty('GASBungieApi/apiKey');
		if (!apiKey) {
			let response = this._apiKeyPrompt(ui, propertyStore);
			propertyStore.setProperty('GASBungieApi/apiKey', response.apiKey);
			propertyStore.setProperty('GASBungieApi/oAuthClientId', response.oAuthClientId);
			propertyStore.setProperty('GASBungieApi/oAuthClientSecret', response.oAuthClientSecret);

			apiKey = response.apiKey;
		}

		let service = GASBungieApi._createService();
		if (!service.hasAccess()) {
			this._showLoginPrompt(ui, service);
			return null;
		}

		let accessToken = service.getAccessToken();
		let membershipId = service.getToken().membership_id;

		return new BungieApi(apiKey, accessToken, membershipId);
	}

	static clearCredentials() {
		let propertyStore = PropertiesService.getUserProperties();
		propertyStore.deleteProperty('GASBungieApi/apiKey');
		propertyStore.deleteProperty('GASBungieApi/oAuthClientId');
		propertyStore.deleteProperty('GASBungieApi/oAuthClientSecret');
		propertyStore.deleteProperty('oauth2.GASBungieApi');
	}

	static _apiKeyPrompt(ui, propertyStore) {
		let options = {};

		let response = ui.prompt(_apiKeyPromptMsg);
		if (response.getSelectedButton() == ui.Button.OK) {
			options.apiKey = response.getResponseText();
			
		} else {
			throw new Error('Failed to get GASBungieApi/apiKey');
		}

		response = ui.prompt('Enter Bungie App OAuth client_id:');
		if (response.getSelectedButton() == ui.Button.OK) {
			options.oAuthClientId = response.getResponseText();
		} else {
			throw new Error('Failed to get GASBungieApi/oAuthClientId');
		}

		response = ui.prompt('Enter Bungie App OAuth client_secret:');
		if (response.getSelectedButton() == ui.Button.OK) {
			options.oAuthClientSecret = response.getResponseText();
		} else {
			throw new Error('Failed to get GASBungieApi/oAuthClientSecret');
		}

		return options;
	}

	static _createService() {
		let propertyStore = PropertiesService.getUserProperties();

		let oAuthClientId = propertyStore.getProperty('GASBungieApi/oAuthClientId');
		let oAuthClientSecret = propertyStore.getProperty('GASBungieApi/oAuthClientSecret');

		return OAuth2.createService('GASBungieApi')
			.setAuthorizationBaseUrl("https://www.bungie.net/en/oauth/authorize")
			.setTokenUrl('https://www.bungie.net/platform/app/oauth/token/')
			.setClientId(oAuthClientId)
			.setClientSecret(oAuthClientSecret)
			.setCallbackFunction(_callbackFunctionName)
			.setPropertyStore(propertyStore);
	}

	static _showLoginPrompt(ui, service) {
		let htmlTemplate = HtmlService.createTemplate(_loginPromptHtmlTemplate);
		htmlTemplate.authorizationUrl = service.getAuthorizationUrl();
		let htmlOutput = htmlTemplate.evaluate();
		ui.showModalDialog(htmlOutput, /*title=*/'Authorization Required');
	}

	static _callback(request) {
		let service = GASBungieApi._createService();
		var isAuthorized = service.handleCallback(request);
		if (isAuthorized) {
			return HtmlService.createHtmlOutput('Success! You can close this tab.');
		} else {
			return HtmlService.createHtmlOutput('Denied. You can close this tab.');
		}
	}
}

let _callbackFunctionName = 'GASBungieApi._callback';

let _apiKeyPromptMsg = `Enter Bungie App API Key:
You can create one at: https://www.bungie.net/en/User/API
Application Name: <Make one up>
Application Status: Private
OAuth Client Type: Confidential
Redirect URL: https://script.google.com/macros/d/${ScriptApp.getScriptId()}/usercallback
Scope: Read your Destiny 2 information (Vault, Inventory, and Vendors), as well as Destiny 1 Vault and Inventory data.`;

let _loginPromptHtmlTemplate = `Click <a href="<?= authorizationUrl ?>" target="_blank">here</a> to redirect to bungie to authorize this app to read your inventory.\n
When done close this dialog and try again.`;
