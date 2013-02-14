$(function($) {
	'use strict';
	
	window.Bank.AccountView = Backbone.View.extend({
	
	    template:_.template($('#account').html()),
	
		initialize: function() {
			// Listen for key model changes
			this.model.on("change:ErrorMessage", this.render, this);
			this.model.on("change:StatusMessage", this.render, this);
			this.model.on("change:Abort", this.render, this);
			
			// Kick off open account process
			this.model.openAccount();
		},
		
	    render:function () {
	    	$(this.el).html(this.template());
	        
	        this.$("#messageBar").hide();
	        
	      	return this;
	    },
	
		events: {
			
	    },
	});
});