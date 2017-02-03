/* jslint browser: true */
/* global Handlebars */
/* global Config */
/* global _gaq */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};


PORTAL_VIEWS.arcGisOnlineDialog = function(el) {
	"use strict";

	var that = {};

	var DIALOG = "Parameters to be used with the wqp_sites layer.";

	var arcGisParameters = Handlebars.compile('Please copy and paste into the appropriate files in ArcGIS Online');

	that.show = function(message) {
		console.log(message)
	};

	that.hide = function() {
		console.log("hide");
	};
};