/* jslint browser: true */
/* global L */
/* global Config */
/* global $ */

var SITE = SITE || {};


SITE.siteMap = function(latitude, longitude, options) {
	"use strict";
	var mapDivId = options.mapDivId;
	var zoom = options.mapZoom;
	var map;
	var hydroLayerEndpoint = Config.HYDRO_LAYER_ENDPOINT;
	var flowlineEndpoint = Config.NHDPLUS_FLOWLINE_ENDPOINT;
	var layername = Config.NHDPLUS_FLOWLINE_LAYER_NAME;
	map = MAPS.create(mapDivId, 'Esri.WorldGrayCanvas');

	var esriHydroLayer = L.esri.tiledMapLayer({
		url: hydroLayerEndpoint
	});
	esriHydroLayer.addTo(map);

	var nhdplusLayer = L.tileLayer.wms(flowlineEndpoint, {
		layers : layername,
		format : 'image/png',
		transparent : true,
		opacity : 0.5
	});
	nhdplusLayer.addTo(map);

	map.setView([latitude, longitude], zoom);
	return map;
};