/* jslint browser: true */
/* global L */

var WQP = WQP || {};
/** @namespace */

WQP.MAPS = WQP.MAPS || {};

/**
 * Create a leaflet map object
 * @param {string} mapDiv The id of the div that should contain the map
 * @param {string} basemapProvider The name of an ESRI base layer (e.g. "Esri.WorldGrayCanvas")
 * @returns {L.map} A Leaflet map object
 */
WQP.MAPS.create = function(mapDiv, basemapProvider) {
	var map;
	var basemapTiles;

	map = L.map(mapDiv);
	basemapTiles = L.tileLayer.provider(basemapProvider);
	basemapTiles.addTo(map);
	return map;
};