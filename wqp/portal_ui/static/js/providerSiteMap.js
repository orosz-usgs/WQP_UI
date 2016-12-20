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


var NLDI = NLDI || {};

NLDI.overlays = function(map) {
	"use strict";
	var map = map;
	var nldiUrl = Config.NLDI_SERVICES_ENDPOINT;
	var site = Config.site;
	var f = 'wqp';
	var e = 'UT';
	var g = 'DM';
	var c = site['MonitoringLocationIdentifier'];
	var d = '16.1';
	var distanceParam = {distance : d};
	var localBaseUrl = Config.localBaseUrl;
	console.log(map);

	var allExtents = {
		"features": [],
		"properties": {
			"title": "all wqp extents"
		},
		"type": "FeatureCollection"
	};

	var geojsonWqpMarkerOptions = {
		radius: 4,
		fillColor: "#ff7800",
		color: "#000",
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	var downstreamLineStyle = {
		"color": "#41b6c4",
		"weight": 5,
		"opacity": 0.65
	};

	var upstreamLineStyle = {
		"color": "#253494",
		"weight": 5,
		"opacity": 0.65,
		"dashArray": '15,8',
		"lineJoin": 'square'
	};

	var onEachPointFeature = function(feature, layer) {
		var parser = document.createElement('a');
		parser.href =  feature.properties.uri;
		var popupText = "Data Source: " + feature.properties.source
			+ "<br>Data Source Name: " + feature.properties.sourceName
			+ "<br>Station Name: " + feature.properties.name
			+ "<br>Station ID: " + feature.properties.identifier
			+ "<br>More Station Data: " + '<a href="' + localBaseUrl + parser.pathname + '">Go to site page</a>';
		layer.bindPopup(popupText);
	};

	var addPointDataToMap = function(data, markerOptions) {
		var markers = L.markerClusterGroup({chunkedLoading:true, spiderfyDistanceMultiplier:3, maxClusterRadius:15});
		var pointLayer = L.geoJson(data, {
			onEachFeature: onEachPointFeature,
			pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, markerOptions);
			}
		});
		markers.addLayer(pointLayer);
		map.addLayer(markers);
	};

	var onEachLineFeature = function(feature, layer) {
		var popupText = "Data Source: NHD+"
			+ "<br>Reach ComID: " + feature.properties.nhdplus_comid;
		layer.bindPopup(popupText);
	};

	var addLineDataToMap = function(data, style) {
		var lineLayer = L.geoJson(data, {
			onEachFeature: onEachLineFeature,
			style: style
			});
		lineLayer.addTo(map);
		_.each(data.features, function(feature) {
			allExtents.features.push(feature);
		}, this);
		map.fitBounds(L.geoJson(allExtents).getBounds());
	};

	var addNldiLinesToMap = function(endpointUrl, style) {
		$.getJSON(endpointUrl, distanceParam, function(data) {
			addLineDataToMap(data, style);
		});
	};

	var addNldiPointsToMap = function(endpointUrl, style) {
		$.getJSON(endpointUrl, distanceParam, function(data) {
			addPointDataToMap(data, style);
		});
	};

	var wqpUrlUt = nldiUrl + f + "/" + c + "/navigate/" + e + "/wqp";
	var wqpUrlDm = nldiUrl + f + "/" + c + "/navigate/" + g + "/wqp";
	var nhdUrlUt = nldiUrl + f + "/" + c + "/navigate/" + e;
	var nhdUrlDm = nldiUrl + f + "/" + c + "/navigate/" + g;

	var nldiLines = [
		{url : nhdUrlUt, style : upstreamLineStyle},
		{url : nhdUrlDm, style : downstreamLineStyle}
	];

	var nldiPoints = [
		{url : wqpUrlUt, style : geojsonWqpMarkerOptions},
		{url : wqpUrlDm, style : geojsonWqpMarkerOptions}
	];
	_.each(nldiLines, function(pair) {
		addNldiLinesToMap(pair.url, pair.style);
	});

	_.each(nldiPoints, function(pair) {
		addNldiPointsToMap(pair.url, pair.style);
	});
};