/* jslint browser: true */
/* global L */
/* global Handlebars */
/* global Config */
/* global _ */
/* global $ */


var SITES = SITES || {};


SITES.sitesMap = function(options) {
	"use strict";
	var siteData = Config.sitesData;
	var localBaseUrl = Config.localBaseUrl;
	var mapDivId = options.mapDivId;
	var map;

	map = MAPS.create(mapDivId, 'Esri.WorldTopoMap');
	map.setView([35.9908385, -78.9005222], 3);

	var getValue = function (x) {
		return x == "Stream" ? "#800026" :
			x == "Well" ? "#FEB24C" :
			x == "Land" ? "#E31A1C" :
			x == "Estuary" ? "#FC4E2A" :
			x == "Facility" ? "#FD8D3C" :
			x == "Glacier" ? "#BD0026" :
			x == "Lake, Reservoir, Impoundment" ? "#FED976" :
				"#FFEDA0";
	};

	var parsePath = function() {
		var pathname = window.location.pathname;
		var splitPath = pathname.split('/');
		var providerName = splitPath[2];
		var orgName = splitPath[3];
		return {providers: providerName, organization: orgName};
	};

	var setPopupValue = function(feature, layer) {
		var parameters = parsePath();
		var providers = parameters.providers;
		var organization = parameters.organization;
		var popupText = "Organization Name: " + feature.properties.OrganizationFormalName
			+ "<br>Station Name: " + feature.properties.MonitoringLocationName
			+ "<br>Station ID: " + feature.properties.MonitoringLocationIdentifier
			+ "<br>Station Type: " + feature.properties.ResolvedMonitoringLocationTypeName
			+'<br>Station Details:  <a href="' + localBaseUrl + '/provider/' + providers + '/' + organization + '/' + feature.properties.MonitoringLocationIdentifier + '/">Go to station page.</a>';
		layer.bindPopup(popupText);
	};

	var addDataToMap = function(data) {
		var markers = L.markerClusterGroup({chunkedLoading: true, spiderfyDistanceMultiplier: 3});
		var dataLayer = L.geoJson(data, {
			onEachFeature: setPopupValue,
			pointToLayer: function (feature, latlng) {
				//here we are using the built-in circleMarker.  If we want to do more, we can make fancier icons
				return L.circleMarker(latlng, {
					radius: 5,
					fillColor: getValue(feature.properties.ResolvedMonitoringLocationTypeName),
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.7
				});
			}
		});
		markers.addLayer(dataLayer);
		map.addLayer(markers);
		map.fitBounds(L.geoJson(data).getBounds());
	};

	addDataToMap(siteData);
};