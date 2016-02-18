/* jslint browser: true */
/* global ol */
/* global WQP */
/* global log */
/* global $ */

var PORTAL = PORTAL || {};
PORTAL.MAP = PORTAL.MAP || {};
/*
 * Manages the site map and its controls
 * @param {Object} options
 * 		@prop {String} - mapDivId
 * 		@prop {Jquery element} - $loadingIndicator
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

	// The GetFeature request is sent back with the project, http://www.opengis.net/gml/srs/epsg.xml#900913
	ol.proj.addEquivalentProjections([ol.proj.get('EPSG:900913'), new ol.proj.Projection({code: 'http://www.opengis.net/gml/srs/epsg.xml#900913'})]);

	/*
	 * Create the site map, with the base layers, overlay layers, and identify controls and event handlers.
	 * Should be called before any of the other methods in this object.
	 */
	self.initialize = function()  {
		var baseLayerGroup = new ol.layer.Group({
			title: 'Base maps',
			layers: [
				WQP.ol3.mapUtils.createXYZBaseLayer(WQP.MapConfig.BASE_LAYER_URL.world_topo, true),
				WQP.ol3.mapUtils.createXYZBaseLayer(WQP.MapConfig.BASE_LAYER_URL.world_street, false),
				WQP.ol3.mapUtils.createXYZBaseLayer(WQP.MapConfig.BASE_LAYER_URL.world_relief, false),
				WQP.ol3.mapUtils.createXYZBaseLayer(WQP.MapConfig.BASE_LAYER_URL.world_imagery, false)
			]
		});
		var overlayLayerGroup = new ol.layer.Group({
			title: 'Overlays',
			layers : []
		});
		var controls = ol.control.defaults().extend([
			new ol.control.LayerSwitcher({
				tipLabel: 'Switch base layers'
			}),
			new ol.control.ScaleLine(),
			new ol.control.MousePosition({
				coordinateFormat : function(coordinate) {
					var lonLat = ol.proj.toLonLat(coordinate);
					return lonLat[0] + ', ' + lonLat[1];
				}
			})
		]);
		var boxIdLayer;
		var worldExtent = ol.extent.applyTransform([-179,-89,179,89], ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

		map = new ol.Map({
			view : new ol.View({
				center : ol.proj.fromLonLat([WQP.MapConfig.DEFAULT_CENTER.lon, WQP.MapConfig.DEFAULT_CENTER.lat]),
				zoom : 3,
				minZoom : 2,
				extent : worldExtent
			}),
			layers : [overlayLayerGroup, baseLayerGroup],
			controls : controls
		});

		WQP.ol3.mapUtils.getNWISSitesLayer({}, {
			visible : false,
			map : map
		}).done(function(layer) {
			overlayLayerGroup.getLayers().push(layer);
		});

		// Set up event handler for single click identify
		map.on('singleclick', function(ev) {
			if (wqpSitesLayer && !boxDrawInteraction.getActive()) {
				var sitesSource = wqpSitesLayer.getSource();
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
				var sitesSource = wqpSitesLayer.getSource();
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
			interaction : boxDrawInteraction
		});
		map.addInteraction(boxDrawInteraction);
		map.addControl(boxIdControl);
	};

	/*
	 * Renders the map options.mapDivId if initialize has been called
	 */
	self.render = function() {
		if ((map) && (!map.getTarget())) {
			map.setTarget(options.mapDivId);
		}
	};

	/*
	 * Show the loading indicator, create the sites layer for the query parameters, and show
	 * on the map. The loading indicator should be removed once the layer has been completely loaded.
	 * @param {Array of Object with name and value properties} queryParamArray - query parameters to be used to retrieve the sites
	 */
	self.updateSitesLayer = function(queryParamArray) {
		if (map) {
			options.$loadingIndicator.show();
			if (wqpSitesLayer) {
				PORTAL.MAP.siteLayer.updateWQPSitesLayer(wqpSitesLayer, queryParamArray);
			}
			else {
				wqpSitesLayer = PORTAL.MAP.siteLayer.createWQPSitesLayer(
					queryParamArray,
					{},
					{
						visible: true,
						map: map
					}
				);
				wqpSitesLayer.getSource().on('sourceloaded', function () {
					options.$loadingIndicator.hide();
				});
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