/* jslint browser: true */
/* global L */
/* global Handlebars */

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

	var BY_DISPLAY_FEATURE_PROP = {
		'states': 'STATE',
		'counties': 'COUNTY_NAME',
		'huc8': 'CAT_NUM'
	};

	var MapWithSingleClickHandler = L.Map.extend({
		includes: L.SingleClickEventMixin
	});

	var DIALOG_TEMPLATE = Handlebars.compile('<div id=coverage-map-popup' +
		 	'<div id="coverage-map-id-title">{{title}}</div>' +
			'<button type="button" class="btn">Zoom to feature</button><br/>' +
			'<p><b>Total discrete samples: </b>{{discreteSampleCount}}</p>' +
			'{{#if minDate }}<p>Samples taken from {{minDate}} to {{maxDate}}</p>{{/if}}' +
			'{{#if epaDiscreteSample}}<p><b>EPA STORET discrete samples: </b>{{epaDiscreteSample}}</p>' +
			'{{#if nwisDiscreteSample}}<p><b>USGS NWIS discrete samples: </b>{{nwisDiscreteSample}}</p>'
	)


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

	map.addSingleClickHandler(function(ev) {
		var southwestPoint = L.point(ev.layerPoint.x - 5, ev.layerPoint.y - 5);
		var northeastPoint = L.point(ev.layerPoint.x + 5, ev.layerPoint.y + 5);
		var bounds = L.latLngBounds(
			map.layerPointToLatLng(southwestPoint),
			map.layerPointToLatLng(northeastPoint)
		);
		var popup = L.popup().setLatLng(ev.latlng);
		dataLayer.fetchFeatureInBBox(bounds)
			.done(function(resp) {
				console.log('Got response');
			});
	});


	self.updateDataLayer = function(layerParams) {
		dataLayer.updateLayerParams(layerParams);
		updateLegend();
	};

	return self;
};