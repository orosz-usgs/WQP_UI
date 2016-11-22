/* jslint browser: true */
/* global L */
/* global Config */
/* global WQP */

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

		var singleClickHandler = function(ev) {
			var southwestPoint = L.point(ev.layerPoint.x - 5, ev.layerPoint.y - 5);
			var northeastPoint = L.point(ev.layerPoint.x + 5, ev.layerPoint.y + 5);
			var bounds = L.latLngBounds(
				map.layerPointToLatLng(southwestPoint),
				map.layerPointToLatLng(northeastPoint)
			);

			if (wqpSitesLayer) {
				wqpSitesLayer.fetchSitesInBBox(bounds)
					.done(function(resp) {
						options.identifyDialog.showDialog({
							features: resp.features,
							queryParamArray : wqpSitesLayer.getQueryParamArray(),
							boundingBox : WQP.L.Util.toBBoxString(bounds),
							usePopover : PORTAL.UTILS.isExtraSmallBrowser()
						});
					})
					.fail(function() {
						console.log('Failed to fetch bbox');
					});
			}
		}

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

		map.addSingleClickHandler(singleClickHandler);

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

	return self;
};