/*jslint browser: true*/
/* global log */
/* global _ */
/* global $ */
/* global Config */
/* global log */
/* global numeral */

var PORTAL = PORTAL || {};

PORTAL.queryServices = (function () {
	"use strict";
	var self = {};

	self.fetchQueryCounts = function(resultType, queryParamArray, providers) {
		var deferred = $.Deferred();

		var queryParamJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
		var countQueryJson = _.omit(queryParamJson, ['mimeType', 'zip', 'sorted']);

		var formatCount = function(countData, key) {
			var countString = _.has(countData, key) ? countData[key] : '0';
			return numeral(countString).format('0,0');
		};

		$.ajax({
			url : Config.QUERY_URLS[resultType] + '/count?mimeType=json',
			method : 'POST',
			contentType : 'application/json',
			data : JSON.stringify(countQueryJson),
			success : function(data) {
				var result = {
					total : {
						sites : formatCount(data, 'Total-Site-Count'),
						results : formatCount(data, 'Total-Result-Count')
					}
				};
				_.each(providers, function(provider) {
					result[provider] = {
						sites : formatCount(data, provider + '-Site-Count'),
						results : formatCount(data, provider + '-Result-Count')
					};
				});
				log.debug('Successfully got counts');
				deferred.resolve(result);
			},
			error: function(jqXHR, textStatus) {
				log.error('Unable to contact the WQP services: ' + textStatus);
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



