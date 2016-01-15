/*jslint browser: true*/
/*global $*/
/* global Config */
var PORTAL = PORTAL || {};

PORTAL.queryServices = (function () {
	"use strict";
	var that = {};

	/*
	 * Make a head request for the current set of query parameters and the resultType.
	 * @param {String} resultType - The type of result for which the query should be made.
	 * @returns Jquery promise - The promise is resolved if the head request succeeds and the received xhr object is returned.
	 * If the request is not made due to url length or it fails, the promise is rejects and a string message is returned
	 */
	that.getHeadRequest = function (resultType) {
		var deferred = $.Deferred();
		var url = that.getFormUrl(resultType);

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
	 * @returns {String} -the serialized uery params for the current #params form.
	 */
	that.getQueryParams = function () {
		var IGNORE_PARAM_LIST = ["north", "south", "east", "west", "resultType", "source", "nawqa_project", "project_code"];

		var result = PORTAL.UTILS.getFormQuery($('#params'), IGNORE_PARAM_LIST);

		return result;
	};

	/*
	 * @param {String} resultType
	 * @returns {String} - the url and query params to download data
	 */
	that.getFormUrl = function (resultType /* string */) {
		return Config.QUERY_URLS[resultType] + "?" + that.getQueryParams();
	};

	return that;

}());



