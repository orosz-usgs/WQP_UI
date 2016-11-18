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
			'World Topo': L.tileLayer.provider('Esri.WorldTopoMap'),
			'World Street': L.tileLayer.provider('Esri.WorldStreetMap'),
			'World Relief': L.tileLayer.provider('Esri.WorldShadedRelief'),
			'World Imagery': L.tileLayer.provider('Esri.WorldImagery')
		};
		var esriHydroLayer = L.esri.tiledMapLayer({
			url: Config.HYDRO_LAYER_ENDPOINT
		});
		var nwisSitesLayer = L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
			layers: 'qw_portal_map:nwis_sites',
			format: 'image/png',
    		transparent: true
		});

		map = new MapWithSingleClickHandler(options.mapDivId, {
			center: [37.0, -100.0],
			zoom: 3,
			layers: [baseLayers['World Topo'], esriHydroLayer]
		});

		map.addControl(L.control.layers(baseLayers, {
			'ESRI Hyro Layer' : esriHydroLayer,
			'NWIS Stream Gages' : nwisSitesLayer
		}));
		map.addControl(L.control.scale());
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

		// Set up sld switcher
		options.$sldSelect.change(function() {
			if (wqpSitesLayer) {
				PORTAL.MAP.siteLayer.updateWQPSitesSLD(wqpSitesLayer, options.$sldSelect.val());
			}
		});
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
					styles : options.$sldSelect.val()
				});
				wqpSitesLayer.on('loading', function() {
					console.log('Start loading');
					options.$loadingIndicator.show();
				});
				wqpSitesLayer.on('load', function() {
					console.log('Finished loading');
					options.$loadingIndicator.hide();
				});
				map.addLayer(wqpSitesLayer);
				//wqpSitesLayer.getSource().on('sourceloaded', function () {
				//	options.$loadingIndicator.hide();
				//	options.$legendDiv.html('<img  src="' + PORTAL.MAP.siteLayer.getLegendGraphicURL(wqpSitesLayer.getSource()) + '" />');
//
//				});
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