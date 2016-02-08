/* jslint browser: true */
/* global ol */
/* global WQP */

var PORTAL = PORTAL || {};

/*
 * Manages the site map and its controls
 * @param {Object} options
 * 		@prop {String} - mapDivId
 * @return {Object}
 * 		@func initialize
 * 		@func render
 */
PORTAL.siteMap = function(options) {
	"use strict";

	var self = {};

	var map;

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
			})
		]);

		map = new ol.Map({
			view : new ol.View({
				center : ol.proj.fromLonLat([WQP.MapConfig.DEFAULT_CENTER.lon, WQP.MapConfig.DEFAULT_CENTER.lat]),
				zoom : 3
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
	};

	self.render = function() {
		if (!map.getTarget()) {
			map.setTarget(options.mapDivId);
		}
	};

	return self;
};