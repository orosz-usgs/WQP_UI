/* jslint browser: true */
/* global L */
/* global Config */
/* global _ */
/* global $ */

var SITE = SITE || {};


SITE.siteMap = function(options) {
	"use strict";
	var mapDivId = options.mapDivId;
	var map;
	var basemapTiles;
	var site = Config.site;
	map = L.map(mapDivId);
	basemapTiles = L.tileLayer.provider('Esri.WorldGrayCanvas');
	basemapTiles.addTo(map);

	var esriHydroLayer = L.esri.tiledMapLayer({
		url: "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});
	esriHydroLayer.addTo(map);

	var nhdplusLayer = L.tileLayer.wms('https://cida.usgs.gov/nwc/geoserver/gwc/service/wms', {
		layers : 'nhdplus:nhdflowline_network',
		format : 'image/png',
		transparent : true,
		opacity : 0.5
	});
	nhdplusLayer.addTo(map);

	map.setView([site.LatitudeMeasure, site.LongitudeMeasure], 10);
	return map;
};