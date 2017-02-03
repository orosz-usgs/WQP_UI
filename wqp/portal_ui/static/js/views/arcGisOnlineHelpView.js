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
		var $sldSelect = options.$mapContainer.find('#sld-select-input');

		$arcGisOnlineButton.click(function() {
			var queryParamArray = options.getQueryParamArray()
			var selectedSld = $sldSelect.val();
			options.arcGisOnlineDialog.show(queryParamArray, selectedSld);
		});
	};
	return self;
};
