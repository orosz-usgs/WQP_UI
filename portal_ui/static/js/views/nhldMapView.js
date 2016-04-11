/* jslint browser: true */
/* global L */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates the NHLD maps, an inset map and a larger map
 * @param {Object} options
 * 		@prop {String} insetMapDivId
 * 		@prop {String} mapDivId
 */
PORTAL.VIEWS.nhldMapView  = function(options) {
	"use strict";

	var self = {};

	var insetBaseLayers = {
		'World Topo' : L.tileLayer.provider('Esri.WorldPhysical')
	};

	var baseLayers = {
		'World Topo' : L.tileLayer.provider('Esri.WorldPhysical'),
		'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
		'World Relief' : L.tileLayer.provider('Esri.WorldShadedRelief'),
		'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
	};

	var layerSwitcher = L.control.layers(baseLayers, {});

	var insetMap, map;

	self.initialize = function() {
		insetMap = L.map(options.insetMapDivId, {
			center: [41.0, -100.0],
			zoom : 3,
			layers : [insetBaseLayers['World Topo']]
		});

		map = L.map(options.mapDivId, {
			center: [41.0, -100.0],
			zoom : 4,
			layers : [baseLayers['World Topo']]
		});
		map.addControl(layerSwitcher);
	};

	self.showMap = function() {
		$('#' + options.insetMapDivId).hide();
		$('#' + options.mapDivId).show();
	};

	self.showInsetMap = function() {
		$('#'+ options.insetMapDivId).show();
		$('#' + options.mapDivId).hide();
	};

	return self;
};