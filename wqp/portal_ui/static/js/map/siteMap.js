/* jslint browser: true */
/* global L */
/* global Config */
/* global WQP */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.MAP = PORTAL.MAP || {};
/*
 * Manages the site map and its controls
 * @param {Object} options
 * 		@prop {String} mapDivId
 * 		@prop {Jquery element} $loadingIndicator
 * 		@prop {Jquery element} $legendDiv
 * 		@prop {Jquery element} $sldSelect
 * 		@prop {Object instance of PORTAL.VIEWS.identifyDialog} identifyDialog
 * @return {Object}
 * 		@func initialize
 * 		@func render
 * 		@func addSitesLayer
 *		@func clearBoxIdFeature
 */
PORTAL.MAP.siteMap = function(options) {
	"use strict";

	var self = {};

	var BASE_LAYER_Z_INDEX = 1;
	var HYDRO_LAYER_Z_INDEX = 2;
	var NWIS_SITES_LAYER_Z_INDEX = 3;
	var WQP_SITES_LAYER_Z_INDEX = 4;


	var map;
	var wqpSitesLayer;

	var boxIdSource;
	var boxDrawInteraction;
	var boxIdControl;

	/*
	 * Create the site map, with the base layers, overlay layers, and identify controls and event handlers.
	 * Should be called before any of the other methods in this object.
	 */
	self.initialize = function() {
		var MapWithSingleClickHandler = L.Map.extend({
			includes: L.SingleClickEventMixin
		});
		var baseLayers = {
			'World Topo': L.tileLayer.provider('Esri.WorldTopoMap', {zIndex : BASE_LAYER_Z_INDEX}),
			'World Street': L.tileLayer.provider('Esri.WorldStreetMap', {zIndex : BASE_LAYER_Z_INDEX}),
			'World Relief': L.tileLayer.provider('Esri.WorldShadedRelief', {zIndex : BASE_LAYER_Z_INDEX}),
			'World Imagery': L.tileLayer.provider('Esri.WorldImagery', {zIndex : BASE_LAYER_Z_INDEX})
		};
		var esriHydroLayer = L.esri.tiledMapLayer({
			url: Config.HYDRO_LAYER_ENDPOINT,
			zIndex : HYDRO_LAYER_Z_INDEX
		});
		var nwisSitesLayer = L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
			layers: 'qw_portal_map:nwis_sites',
			format: 'image/png',
    		transparent: true,
			zIndex : NWIS_SITES_LAYER_Z_INDEX
		});

		map = new MapWithSingleClickHandler(options.mapDivId, {
			center: [37.0, -100.0],
			zoom: 3,
			layers: [baseLayers['World Topo'], esriHydroLayer]
		});

		map.addControl(L.control.layers(baseLayers, {
			'ESRI Hyro Layer' : esriHydroLayer,
			'NWIS Stream Gages' : nwisSitesLayer
		}, {
			autoZIndex : false
		}));
		map.addControl(L.control.scale());

		//Set up sld switcher
		options.$sldSelect.change(function() {
			if (wqpSitesLayer) {
				wqpSitesLayer.setParams({
					styles: options.$sldSelect.val()
				});
			}
		});
	};
/*
		var boxIdLayer;
		var worldExtent = ol.extent.applyTransform([-179,-89,179,89], ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

		// Set up event handler for single click identify
		map.on('singleclick', function(ev) {
			if (wqpSitesLayer && !boxDrawInteraction.getActive()) {
				var lowerLeft = map.getCoordinateFromPixel([ev.pixel[0] - 5, ev.pixel[1] + 5]);
				var upperRight = map.getCoordinateFromPixel([ev.pixel[0] + 5, ev.pixel[1] - 5]);
				var boundingBox =[lowerLeft[0], lowerLeft[1], upperRight[0], upperRight[1]];
				var queryParamArray = wqpSitesLayer.getProperties().queryParamArray;

				PORTAL.MAP.siteLayer.getWQPSitesFeature(queryParamArray, boundingBox)
					.done(function(resp) {
						options.identifyDialog.showDialog({
							features : resp,
							queryParamArray : queryParamArray,
							boundingBox : ol.proj.transformExtent(boundingBox, 'EPSG:900913', 'EPSG:4326'),
							usePopover : PORTAL.UTILS.isExtraSmallBrowser()
						});
					});
			}
		});

		// Create source and vector layer to show identify box. Set up event handler to retrieve the features
		boxIdSource = new ol.source.Vector({
			wrapX : false
		});
		boxIdSource.on('addfeature', function() {
			if (wqpSitesLayer) {
				var boundingBox = this.getExtent();
				var queryParamArray = wqpSitesLayer.getProperties().queryParamArray;

				PORTAL.MAP.siteLayer.getWQPSitesFeature(queryParamArray, boundingBox)
					.done(function(resp) {
						options.identifyDialog.showDialog({
							features : resp,
							queryParamArray : queryParamArray,
							boundingBox : ol.proj.transformExtent(boundingBox, 'EPSG:900913', 'EPSG:4326'),
							usePopover : PORTAL.UTILS.isExtraSmallBrowser()
						});
					});
			}
		});

		boxIdLayer = new ol.layer.Vector({
			source : boxIdSource,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
				  color: 'rgba(255, 165, 0, 0.2)'
				}),
				stroke: new ol.style.Stroke({
				  color: 'rgb(255, 165, 0',
				  width: 1
				})
			})
		});
		map.addLayer(boxIdLayer);

		// Create interactions to draw identify box.
		boxDrawInteraction  = new ol.interaction.Draw({
			source : boxIdSource,
			type : 'LineString',
			maxPoints : 2,
			geometryFunction : function(coordinates, geometry) {
				var start = coordinates[0];
				var end = coordinates[1];
				if (!geometry) {
					geometry = new ol.geom.Polygon(null);
				}
				geometry.setCoordinates([
					[start, [start[0], end[1]], end, [end[0], start[1]], start]
				]);
				return geometry;
			}
		});
		boxDrawInteraction.on('drawstart', function() {
			boxIdSource.clear();
		});

		// Create the control which will turn on/off the box identify interaction.
		boxIdControl = new PORTAL.MAP.ToggleControl({
			interaction : boxDrawInteraction,
			tooltip : 'Toggle to enable box identify. Click on a point and then move the mouse to the opposite corner of desired area of interest.'
		});
		map.addInteraction(boxDrawInteraction);
		map.addControl(boxIdControl);
	};


	/*
	 * Renders the map options.mapDivId if initialize has been called
	 */
	self.render = function() {
		if (map) {
			map.invalidateSize();
			map.setView(map.getCenter(), map.getZoom());
		}
	};

	/*
	 * Show the loading indicator, create the sites layer for the query parameters, and show
	 * on the map. The loading indicator should be removed once the layer has been completely loaded.
	 * @param {Array of Object with name and value properties} queryParamArray - query parameters to be used to retrieve the sites
	 */
	self.updateSitesLayer = function(queryParamArray) {
		if (map) {
			//options.$loadingIndicator.show();
			if (wqpSitesLayer) {
				wqpSitesLayer.updateQueryParams(queryParamArray);
			}
			else {
				wqpSitesLayer = L.wqpSitesLayer(queryParamArray, {
					styles : options.$sldSelect.val(),
					zIndex : WQP_SITES_LAYER_Z_INDEX
				});
				wqpSitesLayer.on('loading', function() {
					options.$loadingIndicator.show();
				});
				wqpSitesLayer.on('load', function() {
					options.$loadingIndicator.hide();
					options.$legendDiv.html('<img  src="' + wqpSitesLayer.getLegendGraphicURL() + '" />');
				});
				map.addLayer(wqpSitesLayer);
			}

		}
	};

	/*
	 * Clear the box from the box id layer.
	 */
	self.clearBoxIdFeature = function() {
		if (map) {
			boxIdSource.clear();
		}
	};
	return self;
};