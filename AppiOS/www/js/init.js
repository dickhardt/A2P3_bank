/* 
* Copyright (C) Province of British Columbia, 2013
*/

$(document).on("mobileinit", function () {
	//disable JQM router
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;

	/*
	 * It will decrease the time between the touch event and 
	 * the application of the relevant class but will also result 
	 * in a higher chance that the same class will be applied 
	 * even when the user is scrolling (eg, over a long list of links).
	 */
	$.mobile.buttonMarkup.hoverDelay = 0;

    // Set default page transitions
    $.mobile.defaultPageTransition = "none";
                 
    // Remove page from DOM when it's being replaced
    $('div[data-role="page"]').live('pagehide', function (event, ui) {
        $(event.currentTarget).remove();
    });
});

window.Bank = window.Bank || {};
window.Bank.Context = { BaseUrl: 'http://localhost' };

/*
 * Global notification system. Function will use PhoneGap notification if
 * available otherwise we'll use standard JS alert for debugging/testing.
 * Necessary to use PG alert in iOS. Calling JS alert from barcode scan
 * callbacks caused threading error. PG alert handles this threading for us.
 */
window.Bank.Notify = function(message, title, button, callback) {
 	if (navigator.notification != null) {
 		if (!title) title = "Bank";
		navigator.notification.alert(message, callback, title, button);
 	}
 	else {
 		alert(message);
 	}
};

/*
 * Javascript function called by Cordova from handleOpenURL delegate.
 * In the iOS Bank, the custom URL schema a2p3.net is registered in the XCode Info.plist.
 * You cannot launch any interactive features like alerts in the handleOpenURL code, 
 * if you do, your app will hang. Similarly, you should not call any Cordova APIs in 
 * there, unless you wrap it first in a setTimeout call, with a timeout value of zero
 *  */
function handleOpenURL(url) {
	console.log("url from iOS = " + url);
	setTimeout(function() {
		app.mobileUrlInvokeHandler(url);
	}, 0);
	
}

/*
 * To instantiate FastClick on the body,
 * https://github.com/ftlabs/fastclick
 */
window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);

