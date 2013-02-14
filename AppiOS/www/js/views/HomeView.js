$(function($) {
	'use strict';
	
	window.Bank.HomeView = Backbone.View.extend({
	
	    template:_.template($('#home').html()),
	
		initialize: function(url) {
			
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