/* jslint browser: true */

/* global L */
/* global Config */


const PORTAL = window.PORTAL = window.PORTAL || {};

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
			var queryWithoutDataProfileArray = queryParamArray.filter(function(param) {
				return param.name !== 'dataProfile';
			});
			var queryString = PORTAL.UTILS.getQueryString(queryParamArray);
			var queryStringWithoutDataProfile = PORTAL.UTILS.getQueryString(queryWithoutDataProfileArray);

			$apiQueryDiv.show();
			$sitesText.html(PORTAL.queryServices.getFormUrl('Station', queryStringWithoutDataProfile));
			$resultsText.html(PORTAL.queryServices.getFormUrl('Result', queryString));
			$activitiesText.html(PORTAL.queryServices.getFormUrl('Activity', queryStringWithoutDataProfile));
			$activitymetricsText.html(PORTAL.queryServices.getFormUrl('ActivityMetric', queryStringWithoutDataProfile));
			$resultdetectionText.html(PORTAL.queryServices.getFormUrl('ResultDetectionQuantitationLimit', queryStringWithoutDataProfile));
			$wfsText.html(L.WQPSitesLayer.getWfsGetFeatureUrl(queryWithoutDataProfileArray));
		});
	};

	return self;

};

