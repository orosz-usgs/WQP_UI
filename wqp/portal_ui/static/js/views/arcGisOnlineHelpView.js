/* jslint browser: true */
/* global _gaq */
/* global $ */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};


PORTAL.VIEWS.arcGisOnlineHelpView = function(options) {
	"use strict";

	var self = {};

	self.initialize = function() {
		var $arcGisOnlineButton = options.$container.find('#show-arcgis-online-help');

		$arcGisOnlineButton.click(function() {
			options.arcGisOnlineDialog.show();
		});
	};
	return self;
};
