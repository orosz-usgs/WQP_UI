/* jslint browser: true */
/* global ol */
/* global Config */
/* global _ */

var WQP = WQP || {};

WQP.ol3 = WQP.ol3 || {};

WQP.ol3.mapUtils = (function() {
	"use strict";

	var self = {};

	self.createXYZBaseLayer = function(layerInfo, isVisible) {
		return new ol.layer.Tile({
			title : layerInfo.name,
			type : 'base',
			visible : isVisible,
			source : new ol.source.XYZ({
				attributions : [
					new ol.Attribution({
						html : layerInfo.attribution
					})
				],
				url : layerInfo.url + '{z}/{y}/{x}'
			})
		});
	};

	/*
	 * @param {Object} params - Overrides for WMS parameters
	 * @ returns a promise which is resolved when the layer has been created. The
	 *   layer is returned in the deferred's response
	 */

	self.getEsriHydroLayer = function(isVisible, map) {
		var esriHydroURL = 'http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer/tile/';
		var hydroTileLayer = new ol.layer.Tile({
			title : 'ESRI Hydro Layer',
			map : map,
			visible : isVisible,
			source : new ol.source.XYZ({
				url : esriHydroURL + '{z}/{y}/{x}'
			})
		});
		return hydroTileLayer;
	};

	self.getNWISSitesLayer = function (wmsParams, layerOptions) {
		var defaultParams = {
			LAYERS: 'qw_portal_map:nwis_sites',
			VERSION: '1.1.1',
			FORMAT: 'image/png',
			TRANSPARENT: true
		};
		var defaultLayerOptions = {
			title : 'NWIS Stream Gages'
		};

		var finalWMSParams = _.extend({}, defaultParams, wmsParams);
		var finalLayerOptions = _.extend({}, defaultLayerOptions, layerOptions);

		var layerSource = new ol.source.TileWMS({
			params: finalWMSParams,
			url : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms'
		});
		finalLayerOptions.source = layerSource;
		return new ol.layer.Tile(finalLayerOptions);
/*
		var sldDeferred = $.Deferred();
		var getLayerDeferred = $.Deferred();
		$.ajax({
			url: Config.NWIS_SITE_SLD_URL,
			dataType: 'text',
			success: function (data) {
				finalWMSParams.SLD_BODY = data;
				sldDeferred.resolve();
			},
			error: function () {
				sldDeferred.resolve();
			}
		});
		sldDeferred.done(function() {
			var layerSource = new ol.source.TileWMS({
				params : finalWMSParams,
				url : Config.NWIS_SITES_OGC_ENDPOINT
			});
			finalLayerOptions.source = layerSource;
			getLayerDeferred.resolve(new ol.layer.Tile(finalLayerOptions));
		});
		return getLayerDeferred.promise();
		*/
	};

	return self;

})();