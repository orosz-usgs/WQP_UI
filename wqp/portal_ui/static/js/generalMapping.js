/* jslint browser: true */
/* global L */

var WQP = WQP || {};

WQP.MAPS = WQP.MAPS || {};

WQP.MAPS.create = function(mapDiv, basemapProvider) {
	var map;
	var basemapTiles;

	map = L.map(mapDiv);
	basemapTiles = L.tileLayer.provider(basemapProvider);
	basemapTiles.addTo(map);
	return map;
};