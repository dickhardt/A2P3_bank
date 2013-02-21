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
			// Logon process
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
			"DI": '',
			
		},

		urlRoot: window.Bank.Context.BaseUrl + '/api/Account',
		
		initialize: function() {
			
			if (this.get("State") == "New") {
				this.openAccount();
			}
			else if (this.get("State") == "Logon") {
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
			this.set("StatusMessage", "Calling Bank to with Agent response...");
			
			// Get the request portion
			var parsedUrl = parseUri(this.get("ResponseSourceUrl"));
			
            var error = parsedUrl.queryKey.error;
                                                if (error &&
                                                    error == "USER_CANCELLED") {
                                                this.set("ErrorMessage", "You cancelled the logon.");
                                                return;
                                                }
                                                
			var token = parsedUrl.queryKey.token;
			if (!token) {
				this.set("ErrorMessage", "Missing token parameter in response url.");
				return;
			}
			var request = parsedUrl.queryKey.request;
			if (!request) {
				this.set("ErrorMessage", "Missing request parameter in response url.");
				return;
			}
			// they are other parts but we don't need them for the bank app
			
			// make up Bank URL
			var url = settings.getBankURL();
			url += "/response/app";
			
			// Assemble data
			var data = {"request": request, "token": token};
			
			// Call Bank
			$.ajax({url: url, 
				type: "POST",
				dataType: "json",
				contentType: "application/json;", 
				data: JSON.stringify(data),
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.processResponseError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.processResponseCallback});
		},
		
		/*
		 * When bad things happen on processing the response
		 */
		processResponseError: function (jqXHR, textStatus, errorThrown, url) {
			this.set({"ErrorMessage": "The bank is unavailable at: " + url,
				"Abort": true});	
		},
		
		/*
		 * The bank responded from our call with the IX token
		 */
		processResponseCallback: function (data, textStatus, jqXHR) {
			console.log("bank data = " + JSON.stringify(data));
			if (textStatus == "success") {
				if (data.error) {
					
					this.set({"ErrorMessage": "Bank could not process this request.  Did you open an account yet?",
						"Abort": true});
				
				}
				else if (data.result.success) {					
					// get profile
					this.getProfile();
				}
			}
			else {
				this.set({"ErrorMessage": "Providing bank with IX Token failed with: " + textStatus,
					"Abort": true});
			}
		},

		/*
		 * Gets user profile for currently logged on user (has cookie set)
		 */
		getProfile: function () {
			this.set("StatusMessage", "Getting user profile from Bank...");
			
			// make up Bank URL
			var url = settings.getBankURL();
			url += "/profile";
			
			// Call Bank
			$.ajax({url: url, 
				type: "GET",
				dataType: "json",
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.getProfileError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.getProfileCallback});
		},
		
		/*
		 * When bad things happening getting profile
		 */
		getProfileError: function (jqXHR, textStatus, errorThrown, url) {
			this.set({"ErrorMessage": "The bank is unavailable at: " + url,
				"Abort": true});	
		},
		
		/*
		 * Bank responded with a profile, populate our model
		 */
		getProfileCallback: function (data, textStatus, jqXHR) {
			console.log("bank data = " + JSON.stringify(data));

			
			if (textStatus == "success") {
				if (data.result) {
					
					// Pump the result into our model
					this.set({"Name": searchObject(data.result, "name"),
						"DateOfBirth": searchObject(data.result, "dob"),
						"AddressLine1": searchObject(data.result, "address1"),
						"AddressLine2": searchObject(data.result, "address2"),
						"City": searchObject(data.result, "city"),
						"Province": searchObject(data.result, "province"),
						"Postal": searchObject(data.result, "postal"),
						"Email": searchObject(data.result, "email"),
						"SocialInsuranceNumber": searchObject(data.result, "si"),
						"DI": searchObject(data.result, "di")});
						
					// Add to our settings
					settings.set("DI", searchObject(data.result, "di"));
					
					// Don't judge me
					if (!this.get("Name") ||
						this.get("Name").length < 1) {
							
						this.set("State", "Open");
					}
					else {
						this.set("State", "Consent");
					}
				}
			}
			else {
				this.set({"ErrorMessage": "Getting profile frmo Bank failed with: " + textStatus,
					"Abort": true});
			}
			
			// Done
			this.set("StatusMessage", "");
		},
		
		/*
		 * When a user agrees
		 */
		agree: function () {
			this.set("StatusMessage", "Calling Bank to create new account");
			
			// Get base URL
			var url = settings.getBankURL();
			
			// Add on endpoint
			url += "/agree/tos";
			
			// Call Bank
			$.ajax({url: url, 
				type: "POST",
				dataType: "json",
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.agreeError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.agreeCallback});
		},
		
		/*
		 * When bad thing happen when agreeing
		 */
		agreeError: function (jqXHR, textStatus, errorThrown, url) {
			this.set({"ErrorMessage": "The bank is unavailable at: " + url,
				"Abort": true});	
		},
		
		/*
		 * Bank responded to our agreement
		 */
		agreeCallback: function (data, textStatus, jqXHR) {
			console.log("bank data = " + JSON.stringify(data));
			if (textStatus == "success") {
				// that's enough
				this.set({"State": "Open",
					"StatusMessage": ""});
			}
			else {
				this.set({"ErrorMessage": "Trying to create account with Bank failed with: " + textStatus,
					"Abort": true});
			}
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
			$.ajax({url: url, 
				type: "POST",
				dataType: "json",
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.getAgentRequestError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.getAgentRequestCallback});
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
						this.getAgentRequestError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.getAgentRequestCallback});
			
		},
		
		/*
		 * When bad things happen trying to contact the bank
		 */
		getAgentRequestError: function (jqXHR, textStatus, errorThrown, url) {
			this.set({"ErrorMessage": "The bank is unavailable at: " + url,
				"Abort": true});	
		},
		
		/*
		 * We should have a agent request in this method
		 */
		getAgentRequestCallback: function (data, textStatus, jqXHR) {
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
		
		/*
		 * Closes the user's bank account
		 */
		close: function () {
			this.set("StatusMessage", "Calling Bank to close account...");
			
			// Get base URL
			var url = settings.getBankURL();
			
			// Add on endpoint
			url += "/close?json=true";
			
			// Call Bank
			$.ajax({url: url, 
				type: "GET",
				dataType: "json",
				context: this,
				error: function(url) {
					return function(jqXHR, textStatus, errorThrown) {
						this.closeError(jqXHR, textStatus, errorThrown, url)
					}}(url),
				success: this.closeSuccess});
		},
		
		/*
		 * When bad things happen trying close the account
		 */
		closeError: function (jqXHR, textStatus, errorThrown, url) {
			this.set({"ErrorMessage": "The bank is unavailable at: " + url,
				"Abort": true});	
		},
		
		/*
		 * Closing account callback
		 */
		closeSuccess: function (data, textStatus, jqXHR) {
			console.log("bank data = " + JSON.stringify(data));
			if (textStatus == "success") {
				if (data.result.success) {
					this.set("State", "Closed");
				}
				else {
					this.set({"ErrorMessage": "Closing account failed with: " + data.error.message,
						"Abort": true});
				}
			}
			else {
				this.set({"ErrorMessage": "Closing account failed with: " + textStatus,
					"Abort": true});
			}
		},
		
	});

})();