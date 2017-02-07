/* jslint browser: true */
/* global Handlebars */
/* global log */
/* global Config */
/* global L */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * @param {Jquery element} $button - Arc GIS help button
 * @param {Jquery element} $dialog - Arc GIS help dialog
 * @param {Jquery element} $siteMapViewContainer - The map view container element
 * @param {Function} getQueryParamArray -
 * 		@returns {Array of Objects with name and value properties} - The form's current query parameters.
 */
PORTAL.VIEWS.arcGisOnlineHelpView = function(options) {
	"use strict";

	var self = {};

	var HEADER = "Parameters to be used with the wqp_sites layer";

	var NULL_TEMPLATE = function() {
		return 'Template has not been loaded';
	};

	var dialogBodyTemplate =  NULL_TEMPLATE;

	/*
	 * Shows the Arc GIS help dialog with the content reflecting the parameters.
	 * @param {Array of Objects with name and value properties} - Represents the query parameters that
	 * 		will be in the dialog
	 * @param {String} selectedSld - The SLD string that will be used to in the dialog
	 */
	var showDialog = function(queryParams, selectedSld) {
		var wfsUrl = decodeURIComponent(L.WQPSitesLayer.getWfsGetFeatureUrl(queryParams));
		var queryStr = wfsUrl.substring(wfsUrl.indexOf('?') + 1);
		var queryStrPairs = queryStr.split('&');
		var parameters = {};
		queryStrPairs.forEach(function(pair) {
			pair = pair.split('=');
			parameters[pair[0]] = pair[1];
		});
		var hbContext = {
			searchParams : parameters.SEARCHPARAMS,
			style : selectedSld
		};

		options.$dialog.find('.modal-body').html(dialogBodyTemplate(hbContext));
		options.$dialog.modal('show');
	};

	/*
	 * Read handlebar template
	 */
	$.ajax({
		url : Config.STATIC_ENDPOINT + 'js/hbTemplates/arcGisHelp.hbs',
		cache: false,
		success : function(response) {
			dialogBodyTemplate = Handlebars.compile(response);
		},
		error : function( ) {
			log.error('Unable to read template hbTemplates/nldiFeatureSourcePopup.hbs');
		}
	});

	/*
	 * Initialize the Arc GIS online view, initializing content and setting up event handlers as needed.
	 */
	self.initialize = function() {
		var $sldSelect = options.$siteMapViewContainer.find('#sld-select-input');

		options.$dialog.find('.modal-header h4').html(HEADER);

		options.$button.click(function() {
			var queryParamArray = options.getQueryParamArray();
			var selectedSld = $sldSelect.val();
			showDialog(queryParamArray, selectedSld);
		});
	};
	return self;
};
