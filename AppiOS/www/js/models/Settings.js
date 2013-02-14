/* 
* Copyright (C) Province of British Columbia, 2013
*/

(function() {
	'use strict';

	// ----------
	// Settings Model
	// Uses jStorage (HTML5 localStorage implementation
	// Quirk: The uuid for iOS is not unique for a device, 
	// but is unique per application per install. This will 
	// change if you delete the app and re-install, and possibly 
	// also when you upgrade your iOS version, or even upgrade 
	// your app per version (as we've seen in iOS 5.1). Not a reliable value.	
	// ----------

	window.Bank.Settings = Backbone.Model.extend({

		// Default attributes
		defaults: {
			BankServerProtocol: '',
			BankServerHost: '',
			BankServerPort: '',
		},

		urlRoot: window.Bank.Context.BaseUrl + '/api/settings',
		
		// Singleton pattern checks if there is an existing configuration file
		initialize: function(resetto) {
			
			// check for localstorage
		 	if ($.jStorage.get('settings'))
			{
				// set defaults to what is found in localstorage
				this.set($.jStorage.get('settings'));
				//console.log('Settings retrieved from storage = ' + JSON.stringify(this));
			}
			else
			{	    	
	        	var bankServerHost;
	        	var bankServerPort;
	        	
	        	switch (resetto) {
	        		case "local":
	        			bankServerHost = "bank.local.a2p3.net";
	        			bankServerPort = "8080";
	        			break;
	        		case "dev":
	        			bankServerHost = "bank.dev.a2p3.net";
	        			break;
	        		case "prod":
	        		default:
						bankServerHost = "bank.a2p3.net";
	        			break;
	        	}
	        	
	        	// Set bootstrap defaults here, could move this to somewhere more obvious
				this.set({"BankServerProtocol": "http",
					"BankServerHost": bankServerHost,
					"BankServerPort": bankServerPort,
					});
	        	
	        	// store in localstorage
	        	this.save();
	        	console.log('First time settings initialized');
	        	console.log($.jStorage.get('settings'));
			}
		},
		
		/*
		 * Simple function to assemble the URL
		 */
		getBankURL: function () {
			var url = this.get("BankServerProtocol") + "://" + 
				this.get("BankServerHost");
			var port = this.get("BankServerPort");
			if (port &&
				port.length > 0) {
				url += ":" + port;	
			}
			return url;
		},

		
		// Reset to factory settings
		reset: function (resetto) {
			$.jStorage.deleteKey('settings');
			$.jStorage.flush();
			this.initialize(resetto);
			this.trigger("change");
		},

		// Save to local stroage
		save: function () {
			$.jStorage.set('settings', this);
		},
	});

})();