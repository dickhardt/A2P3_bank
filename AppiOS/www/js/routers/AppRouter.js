/* 
* Copyright (C) Province of British Columbia, 2013
*/

(function() {
	'use strict';

	window.Bank.AppRouter = Backbone.Router.extend({
	
	    routes:{
	        "" : "home",
            "home" : "home",
            "info" : "info",
	        "settings" : "settings",
	        "open" : "open",
	    },
	
	    initialize:function () {
	        // Handle back button throughout the application
	        $('.back').live('click', function(event) {
	            window.history.back();
	            return false;
	        });
	        this.firstPage = true;
	    },
	
		/*
		 * Home page, default router
		 */
		home:function () {
	        var homeView = new window.Bank.HomeView();
	        this.changePage(homeView);
	    },
		
		/*
		 * Info page
		 */
		info:function () {
	        this.changePage(new window.Bank.InfoView());
	    },

		/*
		 * Settings page, send in the global instance of settings
		 */
		settings:function () {
			
	        this.changePage(new window.Bank.SettingsView({model: settings}));
	    },

		/*
		 * Open Account page
		 */
		open: function () {
			var account = new window.Bank.Account();
			this.changePage(new window.Bank.AccountView({model: account}));
		},

		/*
		 * Common function to load page
		 */
	    changePage:function (page) {
	    	if (page.pageClass)
	    		$(page.el).attr({ 'data-role': 'page', 'data-theme': 'a', 'class': page.pageClass});
	    	else
	    		$(page.el).attr({ 'data-role': 'page', 'data-theme': 'a'});
	        page.render();
	        $('body').append($(page.el));
	        var transition = $.mobile.defaultPageTransition;
	        
	        // We don't want to slide the first page
	        if (this.firstPage) {
	            transition = 'none';
	            this.firstPage = false;
	        }
	        $.mobile.changePage($(page.el), {changeHash:false, transition: transition});
	        
	        // unhide splash
	        if (navigator.splashscreen) navigator.splashscreen.hide();
	    },
	
	
		/*
		 * Handles incoming URL from mobile device invoke
		 */
		mobileUrlInvokeHandler: function (url) {
			console.log("Handling incoming url = " + url);
			
			// parse URI and drop schema (we only support ONE IX) and drive into router
			var parsedUrl = parseUri(url);
			var path = parsedUrl.relative.replace("//", "");
		
		},
	
	});

})();