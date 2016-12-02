/* jslint browser: true */
/* global L */

var COVERAGE = COVERAGE || {};

/*
 * @param {Object} options
 * 		@prop {String} mapDivId - Div where map will be rendered
 * 	    @prop {Jquery element} $legendImg - image element which will contain the legend
 * 	    @prop {Jquery element} $loadingIndicator - element then will be shown while the data layer is loaded.
 * 		@prop {Object} layerParams -
 * 	 		@prop {String} displayBy - spatial feature
 *	 		@prop {String} timeSpan - Allowed values: past_12_months, past_60_months, all_time
 * 			@prop {String} dataSource - Allowed values: storet, nwis, all.
 */
COVERAGE.coverageMap = function(options) {
	"use strict";
	var self = {};

	var BASE_LAYER_Z_INDEX = 1;
	var DATA_LAYER_Z_INDEX = 3;

	var MapWithSingleClickHandler = L.Map.extend({
		includes: L.SingleClickEventMixin
	});


	var baseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray', {zIndex : BASE_LAYER_Z_INDEX}),
		'World Street' : L.tileLayer.provider('Esri.WorldStreetMap', {zIndex : BASE_LAYER_Z_INDEX})
	};

	var dataLayer = L.coverageLayer(options.layerParams, {
		opacity: 0.6,
		zIndex: DATA_LAYER_Z_INDEX
	});

	var updateLegend = function() {
		options.$legendImg.attr('src', dataLayer.getLegendGraphicURL());
	};

	var map;

	dataLayer.on('loading', function() {
		options.$loadingIndicator.show();
	});
	dataLayer.on('load', function() {
		options.$loadingIndicator.hide();
	});

	map = new MapWithSingleClickHandler(options.mapDivId, {
		center: [37.0, -100.0],
		zoom: 3,
		layers: [baseLayers['World Gray'], dataLayer]
	});


	map.addControl(L.control.layers(baseLayers), {}, {
		autoZIndex : false
	});
	updateLegend();


	self.updateDataLayer = function(layerParams) {
		dataLayer.updateLayerParams(layerParams);
		updateLegend();
	};

	return self;
};