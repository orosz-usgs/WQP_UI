/* jslint browser: true */
/* global ol */
/* global WQP */
/* global log */

var PORTAL = PORTAL || {};

/*
 * Manages the site map and its controls
 * @param {Object} options
 * 		@prop {String} - mapDivId
 * 		@prop {Object instance of PORTAL.VIEWS.identifyDialog} identifyDialog
 * @return {Object}
 * 		@func initialize
 * 		@func render
 */
PORTAL.siteMap = function(options) {
	"use strict";

	var self = {};

	var map;
	var wqpSitesLayer;
	var boxIdSource;
	var boxDrawInteraction;
	var boxIdControl;

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

		boxIdSource = new ol.source.Vector({
			wrapX : false
		});
		var boxIdLayer = new ol.layer.Vector({
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

		ol.proj.addEquivalentProjections([ol.proj.get('EPSG:900913'), new ol.proj.Projection({code: 'http://www.opengis.net/gml/srs/epsg.xml#900913'})]);

		map = new ol.Map({
			view : new ol.View({
				center : ol.proj.fromLonLat([WQP.MapConfig.DEFAULT_CENTER.lon, WQP.MapConfig.DEFAULT_CENTER.lat]),
				zoom : 3
			}),
			layers : [overlayLayerGroup, baseLayerGroup],
			controls : controls
		});

		map.addLayer(boxIdLayer);

		WQP.ol3.mapUtils.getNWISSitesLayer({}, {
			visible : false,
			map : map
		}).done(function(layer) {
			overlayLayerGroup.getLayers().push(layer);
		});

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
		boxIdControl = new PORTAL.BoxIdentifyControl({
			boxDrawInteraction : boxDrawInteraction
		});

		boxDrawInteraction.on('drawstart', function() {
			boxIdSource.clear();
		})
		boxIdSource.on('addfeature', function() {
			if (wqpSitesLayer) {
				var sitesSource = wqpSitesLayer.getSource();
				var boundingBox = this.getExtent();
				var queryParamArray = wqpSitesLayer.getProperties().getParamArray;

				WQP.ol3.mapUtils.getWQPSitesFeature(sitesSource.getParams().SEARCHPARAMS, boundingBox)
					.done(function(resp) {
						options.identifyDialog.showDialog(resp, queryParamArray,
							ol.proj.transformExtent(boundingBox, 'EPSG:900913', 'EPSG:4326'))
					});
			}
		});

		map.addControl(boxIdControl);
		// Set up identify dialog
		map.on('singleclick', function(ev) {
			if (wqpSitesLayer && !boxDrawInteraction.getMap()) {
				var sitesSource = wqpSitesLayer.getSource();
				var lowerLeft = map.getCoordinateFromPixel([ev.pixel[0] - 5, ev.pixel[1] + 5]);
				var upperRight = map.getCoordinateFromPixel([ev.pixel[0] + 5, ev.pixel[1] - 5]);
				var boundingBox =[lowerLeft[0], lowerLeft[1], upperRight[0], upperRight[1]];
				var queryParamArray = wqpSitesLayer.getProperties().queryParamArray;

				WQP.ol3.mapUtils.getWQPSitesFeature(sitesSource.getParams().SEARCHPARAMS, boundingBox)
					.done(function(resp) {
						options.identifyDialog.showDialog(resp, queryParamArray,
							ol.proj.transformExtent(boundingBox, 'EPSG:900913', 'EPSG:4326'));
					});
			}
		});
	};

	self.render = function() {
		if (!map.getTarget()) {
			map.setTarget(options.mapDivId);
		}
	};

	self.addSitesLayer = function(queryParamArray) {
		if (wqpSitesLayer) {
			map.removeLayer(wqpSitesLayer);
		}
		wqpSitesLayer = WQP.ol3.mapUtils.createWQPSitesLayer(
			queryParamArray,
			{},
			{
				visible: true,
				map: map
			}
		);
	};

	self.clearBoxIdFeature = function() {
		boxIdSource.clear();
	}
	return self;
};