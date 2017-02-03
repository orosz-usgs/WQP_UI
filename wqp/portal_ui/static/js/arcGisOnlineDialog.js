/* jslint browser: true */
/* global Handlebars */
/* global Config */
/* global _gaq */
/* global _ */
/* global L */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.arcGisOnlineDialog = function(el) {
	"use strict";

	var that = {};

	var HEADER = "Parameters to be used with the wqp_sites layer.";

	var arcGisParameters = Handlebars.compile('Please copy and paste into the appropriate ' +
	'parameter fields in ArcGIS Online when adding a layer from the web.<br/>' +
	'<table style="width:100%">' +
	'<tr><th>Parameter</th><th>Value</th></tr>' +
	'<tr><td>SEARCHPARAMS</td><td>{{ searchParams }}</td></tr>' +
	'<tr><td>Style</td><td>{{ style }}</td></tr>' +
	'<tr><td>Styles</td><td>{{ style }}</td></tr>' +
	'</table>'
	);

	that.show = function(queryParams, selectedSld) {
		var wfsUrl = decodeURIComponent(L.WQPSitesLayer.getWfsGetFeatureUrl(queryParams));
		var queryStr = wfsUrl.substring(wfsUrl.indexOf('?') + 1);
		var queryStrPairs = queryStr.split('&');
		var parameters = {};
		queryStrPairs.forEach(function(pair) {
			pair = pair.split('=');
			parameters[pair[0]] = pair[1];
		});
		var searchParams = parameters.SEARCHPARAMS;
		var buildContext = function() {
			var context = {
				searchParams : searchParams,
				style : selectedSld
			};
			return arcGisParameters(context);
		};
		el.find('.modal-footer').html('');
		el.find('.modal-body').html(buildContext());
		el.find('.modal-header h4').html(HEADER);
		el.modal('show');
	};

	that.hide = function() {
		el.modal('hide');
	};
	return that;
};