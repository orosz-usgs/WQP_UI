/*jslint browser: true*/
/* global $ */
/* global Config */
var PORTAL = PORTAL || {};

PORTAL.queryServices = (function () {
	"use strict";
	var self = {};

	/*
	 * Make a head request for the current set of query parameters and the resultType.
	 * @param {String} resultType - The type of result for which the query should be made.
	 * @param {String} queryParams - a query string
	 * @returns Jquery promise - The promise is resolved if the head request succeeds and the received xhr object is returned.
	 * If the request is not made due to url length or it fails, the promise is rejects and a string message is returned
	 */
	self.fetchHeadRequest = function (resultType, queryParams) {
		var deferred = $.Deferred();
		var url = self.getFormUrl(resultType, queryParams);

		if (url.length > 2000) {
			deferred.resolve('Too many query criteria selected.  <br>Please reduce your selections <br>' +
				'NOTE: selecting all options for a given criteria is the same as selecting none.<br>' +
				'query length threshold 2000, current length: ' + url.length);
		}
		$.ajax({
			url: url,
			method: 'HEAD',
			cache: false,
			success: function (data, textStatus, jqXHR) {
				deferred.resolve(jqXHR);
			},
			error: function (jqXHR, textStatus) {
				deferred.resolve('Unable to contact the WQP services: ' + textStatus);
			}
		});
		return deferred.promise();
	};

	/*
	 * @param {String} resultType
	 * @param {String} queryParams - a query string
	 * @returns {String} - the url and query params to download data
	 */
	self.getFormUrl = function (resultType, queryParams) {
		return Config.QUERY_URLS[resultType] + "?" + queryParams;
	};

	return self;

}());



