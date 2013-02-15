$(function($) {
	'use strict';
	
	window.Bank.AccountView = Backbone.View.extend({
	
	    template:_.template($('#account').html()),
	
		initialize: function(op) {
			// Listen for key model changes
			this.model.on("change:ErrorMessage", this.render, this);
			this.model.on("change:StatusMessage", this.render, this);
			this.model.on("change:Abort", this.render, this);		
			this.model.on("change:State", this.render, this);		
		},
		
	    render:function () {
	    	this.$el.html(this.template(this.model.toJSON()));
	        
	        // init
	        this.$("#messageBar").hide();
	        this.$("#loadingBar").hide();
	        this.$("#termsOfUseContainer").hide();
	        this.$("#welcomeContainer").hide();
	        
	        // Do messages
	        var status = this.model.get("StatusMessage");
	        if (status) {
	        	this.$("#loadingBar").text(status);
	        	this.$("#loadingBar").show();
	        }
	        var error = this.model.get("ErrorMessage");
	        if (error) {
	        	this.$("#messageBar").text(error);
	        	this.$("#messageBar").show();
	        }
	        
	        // Show hide containers based on model state
	        var state = this.model.get("State");
	        switch (state) {
	        	case "New":
	        		break;
	        	case "Consent":
	        		this.$("#termsOfUseContainer").show();
	        		break;
	        	case "Open":
	        		this.$("#welcomeContainer").show();
	        		break;
	        	case "Closed":
	        		break;
	        }
	        
	        // force jquery to restyle
	    	$(this.el).trigger("pagecreate");
	    	
	      	return this;
	    },
	
		events: {
			"tap a[id=cancel]": "cancel",
			"tap a[id=agree]": "agree",
	    },
	    
	    /*
	     * User event for cancel 
	     */
	    cancel: function () {
	    	// go home
	    	app.navigate("", true);
	    },
	    
	    /*
	     * User event for agree
	     */
	    agree: function () {
	    	// tell the model
	    	this.model.agree();
	    },
	});
});