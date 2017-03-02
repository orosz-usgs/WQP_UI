/* jslint browser: true */
/* global L */
/* global Handlebars */
/* global _ */
/* global $ */

var COVERAGE = COVERAGE || {};

/*
 * @param {Object} options
 * 		@prop {String} mapDivId - Div where map will be rendered
 * 		@prop {Jquery element} $legendImg - image element which will contain the legend
 * 		@prop {Jquery element} $loadingIndicator - element then will be shown while the data layer is loaded.
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
		includes: L.SingleClickEventMixin()
	});

	var DIALOG_TEMPLATE = Handlebars.compile('<div id="coverage-map-popup">' +
		'<div class="popup-title">' +
		'{{title}}</div>' +
		'<button type="button" class="btn">Zoom to feature</button><br/>' +
		'<div>' +
		'<div><b>Total discrete samples: </b>{{DISCRETE_SAMPLE_COUNT}}</div>' +
		'{{#if EPA_DISCRETE_SAMPLE_COUNT}}<div><b>EPA STORET discrete samples: </b>{{EPA_DISCRETE_SAMPLE_COUNT}}</div>{{/if}}' +
		'{{#if NWIS_DISCRETE_SAMPLE_COUNT}}<div><b>USGS NWIS discrete samples: </b>{{NWIS_DISCRETE_SAMPLE_COUNT}}</div>{{/if}}' +
		'</div>');

	var getTitle = function (properties) {
		var result;
		if (_.has(properties, 'COUNTY_NAME')) {
			result = properties.COUNTY_NAME + ', ' + properties.STATE;
		}
		else if (_.has(properties, 'STATE')) {
			result = properties.STATE;
		}
		else {
			result = properties.HUC8;
		}
		return result;
	};


	var baseLayers = {
		'World Gray': L.esri.basemapLayer('Gray', {zIndex: BASE_LAYER_Z_INDEX}),
		'World Street': L.tileLayer.provider('Esri.WorldStreetMap', {zIndex: BASE_LAYER_Z_INDEX})
	};

	var dataLayer = L.coverageLayer(options.layerParams, {
		opacity: 0.6,
		zIndex: DATA_LAYER_Z_INDEX
	});

	var updateLegend = function () {
		options.$legendImg.attr('src', dataLayer.getLegendGraphicURL());
	};

	var map;
	var $mapDiv = $('#' + options.mapDivId);

	dataLayer.on('loading', function () {
		options.$loadingIndicator.show();
	});
	dataLayer.on('load', function () {
		options.$loadingIndicator.hide();
	});

	map = new MapWithSingleClickHandler(options.mapDivId, {
		center: [37.0, -100.0],
		zoom: 3,
		layers: [baseLayers['World Gray'], dataLayer]
	});

	map.addControl(L.control.layers(baseLayers), {}, {
		autoZIndex: false
	});
	updateLegend();

	map.addSingleClickHandler(function (ev) {
		var popup = L.popup().setLatLng(ev.latlng);
		var currentCursor = $mapDiv.css('cursor');
		// The following cleans up the event handler for the zoom button
		popup.on('popupclose', function() {
			$('coverage-map-popup').off();
		});
		$mapDiv.css('cursor', 'progress');
		dataLayer.fetchFeatureAtLocation(ev.latlng)
			.done(function (resp) {
				var context;
				var content = '';
				if (resp.features.length > 0) {
					context = resp.features[0].properties;
					context.title = getTitle(resp.features[0].properties);
					content = DIALOG_TEMPLATE(context);
				}
				else {
					content = "Did not find a coverage map feature. \n Please click within a feature";
				}
				popup.setContent(content).openOn(map);
				$('#coverage-map-popup').on('click', function() {
					var corner1 = L.latLng(resp.bbox[0], resp.bbox[1]);
					var corner2 = L.latLng(resp.bbox[2], resp.bbox[3]);
					map.fitBounds(L.latLngBounds(corner1, corner2));
				});
			})
			.fail(function () {
				popup.setContent('Get Feature request failed').openOn(map);
			})
			.always(function() {
				$mapDiv.css('cursor', currentCursor);
			});
	});


	self.updateDataLayer = function (layerParams) {
		dataLayer.updateLayerParams(layerParams);
		updateLegend();
	};

	return self;
};