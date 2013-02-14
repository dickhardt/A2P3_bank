$(function($) {
	'use strict';
	
	window.Bank.AccountView = Backbone.View.extend({
	
	    template:_.template($('#account').html()),
	
		initialize: function(op) {
			// Listen for key model changes
			this.model.on("change:ErrorMessage", this.render, this);
			this.model.on("change:StatusMessage", this.render, this);
			this.model.on("change:Abort", this.render, this);			
		},
		
	    render:function () {
	    	$(this.el).html(this.template());
	        
	        this.$("#messageBar").hide();
	        this.$("#loadingBar").hide();
	        
	        var status = this.model.get("StatusMessage");
	        if (status) {
	        	this.$("#loadingBar").text(status);
	        	this.$("#loadingBar").show();
	        }
	        
	        // force jquery to restyle
	    	$(this.el).trigger("pagecreate");
	    	
	      	return this;
	    },
	
		events: {
			
	    },
	});
});