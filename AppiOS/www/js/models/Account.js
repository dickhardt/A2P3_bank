/* 
* Copyright (C) Province of British Columbia, 2013
*/

(function() {
	'use strict';

	// ----------
	// Account Model
	// ----------

	window.Bank.Account = Backbone.Model.extend({

		// Default attributes
		defaults: {
			// Error message back to user
			"ErrorMessage": '',
			// Tells our views to stop
			"Abort": '',
			// The agent request from the bank API
			"AgentRequest": '',
			// The raw incoming URL 
			"ResponseSourceUrl": '',
			// A message to show the user of our progres
			"StatusMessage": '',
			// State of the account, 
			// New for request process
			// Login process
			// Consent for the 2nd step in the request process
			// Open for agreed to account
			// Closed 
			"State": '',
			
			// User data section
			"Name": '',
			"AddressLine1": '',
			"AddressLine2": '',
			"City": '',
			"Province": '',
			"Postal": '',
			"DateOfBirth": '',
			"SocialInsuranceNumber": '',
			"Email": '',
			
		},

		urlRoot: window.Bank.Context.BaseUrl + '/api/Account',
		
		initialize: function() {
			
			if (this.get("State") == "New") {
				this.openAccount();
			}
			else if (this.get("State") == "Login") {
				this.logon();
			}
			else {
				this.processResponse();
			}
		},
		
		/*
		 * Processes response URL and determines model state etc
		 */
		processResponse: function () {
			var sourceUrl = this.get("ResponseSourceUrl");
			
		},
		/*
		 * When a user agrees
		 */
		agree: function () {
			this.set("State", "Open");
		},
		
		/*
		 * User should already have an account and wishes to logon
		 */
		logon: function () {
			this.set("StatusMessage", "Calling Bank to get agent request...");
			
			// Get base URL
			var url = settings.getBankURL();
			
			// Add on endpoint
			url += "/login/app";
			
			// Call Bank
			/*
			$.ajax({url: url, 
				type: "POST",
				dataType: "json",
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.getAgentRequestForNewAccountError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.getAgentRequestForNewAccountCallback});*/
		},
		
		/*
		 * Calls Bank API to get agent request 
		 * Invoke's Agent
		 * And returns here
		 */
		openAccount: function () {
			this.set("StatusMessage", "Calling Bank to get agent request...");
			
			// Get base URL
			var url = settings.getBankURL();
			
			// Add on endpoint
			url += "/new/app";
			
			// Call Bank
			$.ajax({url: url, 
				type: "POST",
				dataType: "json",
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.getAgentRequestForNewAccountError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.getAgentRequestForNewAccountCallback});
			
		},
		
		/*
		 * When bad things happen trying to contact the bank
		 */
		getAgentRequestForNewAccountError: function (jqXHR, textStatus, errorThrown, url) {
			this.set({"ErrorMessage": "The bank is unavailable at: " + url,
				"Abort": true});	
		},
		
		/*
		 * We should have a agent request in this method
		 */
		getAgentRequestForNewAccountCallback: function (data, textStatus, jqXHR) {
			console.log("bank data = " + JSON.stringify(data));
			if (textStatus == "success") {
				if (data.result) {
					this.set("AgentRequest", data.result.request);
					this.agentLogon();
				}
				else {
					this.set({"ErrorMessage": "Getting agent request from bank failed with: " + data.error.message,
						"Abort": true});
				}
			}
			else {
				this.set({"ErrorMessage": "Getting agent request from bank failed with: " + textStatus,
					"Abort": true});
			}
		},
		
		/*
		 * Uses the agent request to call the agent
		 */
		agentLogon: function () {
			this.set("StatusMessage", "Calling Agent...");
			
			// Get and test agent request
			var agentRequest = this.get("AgentRequest");
			if (!agentRequest) {
				this.set({"ErrorMessage": "Agent request empty." + textStatus,
					"Abort": true});
			}
			
			// Make up agent URL - TODO: figure out how to manage state or if even required
			// for the PoC allow unsocilated logons
			var agentUrl = "a2p3.net://token?request=" + agentRequest;
			
			console.log("agent url = " + agentUrl);
			
			// Invoke Agent!
			window.location.href = agentUrl;
		},
	});

})();