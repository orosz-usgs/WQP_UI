/* jslint browser: true */
/* global L */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates the NHLD maps, an inset map and a larger map. Only one of the maps is shown.
 * The map shown is changed by clicking the expand/collapse control in the upper right of each map.
 * Each map also contains the Navigation selector.
 * @param {Object} options
 * 		@prop {String} insetMapDivId
 * 		@prop {String} mapDivId
 */
PORTAL.VIEWS.nldiMapView  = function(options) {
	"use strict";

	var self = {};

	var navValue = '';

	var insetMap, map;

	/*
	 * @function
	 * Show the full size map and set it's navigation select value. Hide the inset map
	 */
	var showMap = function () {
		$('#' + options.insetMapDivId).hide();
		$('#' + options.mapDivId).show();
		navControl.setNavValue(navValue);
		map.invalidateSize();
	};

	/*
	 * @function
	 * Show the inset map and set it's navigation select value. Hide the full size map
	 */
	var showInsetMap = function () {
		$('#' + options.insetMapDivId).show();
		$('#' + options.mapDivId).hide();
		insetNavControl.setNavValue(navValue);
		insetMap.invalidateSize();
	};

	/*
	 * @function
	 * @param {DOM event object} ev
	 * Handle the change event for the nav selection control.
	 */
	var navChangeHandler = function(ev) {
		var value = $(ev.target).val();
		navValue = value;
		if (value) {
			showMap();
		}
		else {
			showInsetMap(value);
		}
	};

	var insetBaseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray')
	};
	var insetHydroLayer = L.esri.tiledMapLayer({
		url : "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});

	var baseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray'),
		'World Topo' : L.tileLayer.provider('Esri.WorldTopoMap'),
		'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
		'World Relief' : L.tileLayer.provider('Esri.WorldShadedRelief'),
		'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
	};
	var hydroLayer = L.esri.tiledMapLayer({
		url : "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});
	var layerSwitcher = L.control.layers(baseLayers, {
		'Hydro Reference' : hydroLayer
	});

	var insetNavControl = L.control.nldiNavControl({
		changeHandler : navChangeHandler
	});
	var navControl = L.control.nldiNavControl({
		changeHandler : navChangeHandler
	});

	var expandControl = L.easyButton('fa-lg fa-expand', showMap, 'Expand NLDI Map', {
		position : 'topright'
	});
	var collapseControl = L.easyButton('fa-lg fa-compress', showInsetMap, 'Collapse NLDI Map', {
		position: 'topright'
	});

	/*
	 * Initialize the inset and full size maps.
	 */
	self.initialize = function() {
		insetMap = L.map(options.insetMapDivId, {
			center: [37.0, -100.0],
			zoom : 3,
			layers : [insetBaseLayers['World Gray']],
			zoomControl : false
		});
		insetMap.addLayer(insetHydroLayer);
		insetMap.addControl(expandControl);
		insetMap.addControl(insetNavControl);
		insetMap.addControl(L.control.zoom());

		map = L.map(options.mapDivId, {
			center: [38.5, -100.0],
			zoom : 4,
			layers : [baseLayers['World Gray'], hydroLayer],
			zoomControl : false
		});
		map.addControl(collapseControl);
		map.addControl(layerSwitcher);
		map.addControl(navControl);
		map.addControl(L.control.zoom());
	};

	return self;
};