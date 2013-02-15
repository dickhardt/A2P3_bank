/* 
* Copyright (C) Province of British Columbia, 2013
*/

$(function($) {
	'use strict';
	
	window.Bank.SettingsView = Backbone.View.extend({
	
	    template:_.template($('#settings').html()),
	
		initialize: function(Opts) {
			this.model.on("change", this.render, this);
		},
		
	    render:function (eventName) {
	       	this.$el.html(this.template(this.model.toJSON()));
	        
	        this.$("#bankServerProtocolList").val(this.model.get("BankServerProtocol"));
	        this.$("#bankServerHostList").val(this.model.get("BankServerHost"));
	        			
	    	// force jquery to restyle
	    	$(this.el).trigger("pagecreate");
	    	
	        return this;
	    },
	
		events: {
			"click a[id=save]": "save",
			"click a[id=reset]": "reset",
			"click a[id=cancel]": "cancel",
			"click a[id=confirm]": "confirm",
		},
		
		cancel: function () {
			this.$("#resetDialogue").popup("close");
		},
		
		reset: function () {
			this.$("#resetDialogue").popup("open", 
				{transition: "pop",
				 shadow: true});
		},
		
		confirm: function(ev) {
			var resetto = $(ev.currentTarget).data('resetto');
			
		   	// Reset model
		   	this.model.reset(resetto);
		},
		
		/*
		 * Save the model and go back home
		 */
		save: function () {
			this.model.set({"BankServerProtocol": $("#bankServerProtocolList").val(),
				"BankServerHost": $("#bankServerHostList").val(),
				"BankServerPort": $("#bankServerPort").val(),
				"DI": $("#di").val(),
				})
			this.model.save();
			app.navigate("", true);
		},
	    
	});
});