/* jslint browser: true */
/* global $ */
/* global Handlebars */
/* global log */
/* global Config */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.nldiNavPopupView = (function() {
	"use strict";
	var self = {};

	var NULL_TEMPLATE = function() {
		return 'No template';
	};

	var popupTemplate =  NULL_TEMPLATE;

	/*
	 * Read handlebar templates
	 */
	$.ajax({
		url : Config.STATIC_ENDPOINT + 'js/hbTemplates/nldiFeatureSourcePopup.hbs',
		success : function(response) {
			popupTemplate = Handlebars.compile(response);
		},
		error : function( ) {
			log.error('Unable to read template hbTemplates/nldiFeatureSourcePopup.hbs');
		}
	});

	self.createPopup = function(onMap, feature, atLatLng, navHandler) {
		var nldiData = PORTAL.MODELS.nldiModel.getData();
		var context = {
			nwisSite: nldiData.featureSource.id === 'nwissite',
			pourPoint: nldiData.featureSource.id === 'huc12pp',
			navigationModes: PORTAL.MODELS.nldiModel.NAVIGATION_MODES,
			feature : feature
		};
		var $navButton;

		onMap.openPopup(popupTemplate(context), atLatLng);
		$navButton = $('.navigation-selection-div button');
		$('.navigation-selection-div select').change(function(ev) {
			var $select = $(ev.target);
			var selectedValue = $select.val();
			var navValue = {
				id : selectedValue,
				text : $(ev.target.selectedOptions[0]).html()
			};

			PORTAL.MODELS.nldiModel.setData('navigation', navValue);
			$navButton.prop('disabled', !(navValue.id));
		});
		$('.navigation-selection-div input[type="text"]').change(function(ev) {
			PORTAL.MODELS.nldiModel.setData('distance', $(ev.target).val());
		});
		$navButton.click(navHandler);
	};

	return self;
})();
