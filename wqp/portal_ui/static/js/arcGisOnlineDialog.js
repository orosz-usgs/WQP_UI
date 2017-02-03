/* jslint browser: true */
/* global Handlebars */
/* global Config */
/* global _gaq */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.arcGisOnlineDialog = function(el) {
	"use strict";

	var that = {};

	var HEADER = "Parameters to be used with the wqp_sites layer.";

	var arcGisParameters = Handlebars.compile('Please copy and paste into the appropriate files in ArcGIS Online' +
	'<table style="width:100%">' +
	'<tr><th>Parameter</th><th>Value</th></tr>' +
	'<tr><td>SEARCHPARAMS</td><td>{{ searchParams }}</td></tr>' +
	'<tr><td>Style</td><td>{{ style }}</td></tr>' +
	'</table>'
	);

	that.show = function(message) {
		var buildContext = function() {
			var context = {
				searchParams : 'R2D2',
				style : 'wqp_sources'
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