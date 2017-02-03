/* jslint browser: true */
/* global _gaq */
/* global $ */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};


PORTAL.VIEWS.arcGisOnlineHelpView = function(options) {
	"use strict";

	var self = {};

	options.$container.find('#show-arcgis-online-help').click(function() {
		options.arcGisOnlineDialog.show();
	});
};