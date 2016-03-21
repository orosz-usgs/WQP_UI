/* jslint browser: true */
/* global ol */
/* global Config */
/* global $ */
/* global _ */
/* global log */

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
	self.getNWISSitesLayer = function (wmsParams, layerOptions) {
		var defaultParams = {
			LAYERS: Config.NWIS_SITES_LAYER_NAME,
			VERSION: '1.1.1',
			FORMAT: 'image/png',
			TRANSPARENT: true
		};
		var defaultLayerOptions = {
			title : 'NWIS Stream Gages'
		};

		var finalWMSParams = _.extend({}, defaultParams, wmsParams);
		var finalLayerOptions = _.extend({}, defaultLayerOptions, layerOptions);

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
	};

	return self;

})();