/* jslint browser: true */

/* global L */
/* global Config */


var PORTAL = PORTAL || {};

PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Initializes the windows which show the various API calls
 * @param {Object} options
 * 		@prop {Jquery element} $container - The container containing the show button and the query windows.
 * 		@prop {Function} getQueryParamArray - Returns the current query parameter array
 	* 		@returns {Array of Objects with name and value properties}
 */
PORTAL.VIEWS.showAPIView = function(options) {
	"use strict";

	var self = {};

	self.initialize = function() {
		var $apiQueryDiv = options.$container.find('#api-queries-div');
		var $sitesText = options.$container.find('#sites-query-div textarea');
		var $resultsText = options.$container.find('#results-query-div textarea');
		var $activitiesText = options.$container.find('#activities-query-div textarea');
		var $activitymetricsText = options.$container.find('#activitymetrics-query-div textarea');
		var $resultdetectionText = options.$container.find('#resultdetection-query-div textarea');
		var $wfsText = options.$container.find('#getfeature-query-div textarea');

		options.$container.find('#show-queries-button').click(function() {
			var queryParamArray = options.getQueryParamArray();
			var queryString = PORTAL.UTILS.getQueryString(queryParamArray);

			$apiQueryDiv.show();
			$sitesText.html(PORTAL.queryServices.getFormUrl('Station', queryString));
			$resultsText.html(PORTAL.queryServices.getFormUrl('Result', queryString));
			$activitiesText.html(PORTAL.queryServices.getFormUrl('Activity', queryString));
			$activitymetricsText.html(PORTAL.queryServices.getFormUrl('ActivityMetric', queryString));
			$resultdetectionText.html(PORTAL.queryServices.getFormUrl('ResultDetectionQuantitationLimit', queryString));
			$wfsText.html(L.WQPSitesLayer.getWfsGetFeatureUrl(queryParamArray));
		});
	};

	return self;

};

