/* jslint browser: true */
/* global L */
/* global $ */
/* global Config */
/* global WQP */

(function() {
	"use strict";

	var WMS_VERSION = '1.1.0';
	var WFS_VERSION = '2.0.0';

	var NAMESPACE = 'qw_portal_map';

	var LAYER_NAME = {
		states: NAMESPACE + ':states_all',
		counties: NAMESPACE + ':counties_all',
		huc8: NAMESPACE + ':huc8_all'
	};

	var VIEWPARAMS_SOURCE = {
		'storet': 'source1:E;source2:E',
		'nwis': 'source1:N;source2:N',
		'all': 'source1:E;source2:N'
	};
	var SLD_DATASOURCE = {
		'storet': 'E',
		'nwis': 'N',
		'all': 'A'
	};
	var SLD_FEATURE = {
		'states': 'S',
		'counties': 'C',
		'huc8': 'H'
	};
	var SLD_TIMEFRAME = {
		'past_12_months': '1',
		'past_60_months': '5',
		'all_time': 'A'
	};
	var getLayerName = function(displayBy) {
		return LAYER_NAME[displayBy];
	};
	var getViewParams = function(layerParams) {
		return VIEWPARAMS_SOURCE[layerParams.dataSource] + ';timeFrame:' + layerParams.timeSpan;
	};
	var getSLDURL = function(layerParams) {
		return Config.SLD_ENDPOINT +
			'?dataSource=' + SLD_DATASOURCE[layerParams.dataSource] +
			'&geometry=' + SLD_FEATURE[layerParams.displayBy] +
			'&timeFrame=' + SLD_TIMEFRAME[layerParams.timeSpan];
	};
	var getWMSParams = function(layerParams) {
		return {
			layers : getLayerName(layerParams.displayBy),
			VIEWPARAMS: getViewParams(layerParams),
			sld: getSLDURL(layerParams)
		};
	};

	/*
	 * @constructs - extends L.TileLayer.WMS
	 * The url should not be passed into the constructor. The layers, format, transparent, and version options are
	 * defaulted.
	 * @param {Object} layerParams -
	 * 		@prop {String} displayBy - spatial feature
	 * 		@prop {String} timeSpan - Allowed values: past_12_months, past_60_months, all_time
	 * 		@prop {String} dataSource - Allowed values: storet, nwis, all.
	 * @param {Object} options - Can be any L.TileLayer.WMS options
	 */
	L.CoverageLayer = L.TileLayer.WMS.extend({

		defaultWmsParams: {
			VIEWPARAMS : '',
			layers : '',
			sld : '',
			format: 'image/png',
			version: WMS_VERSION,
			request : 'GetMap',
			transparent: true
		},

		initialize : function(layerParams, options) {
			L.TileLayer.WMS.prototype.initialize.call(this, Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', options);
			$.extend(this.wmsParams, getWMSParams(layerParams));
		},

		updateLayerParams : function(layerParams) {
			this.setParams(getWMSParams(layerParams));
		},

		/*
		 * Returns a url string which can be used to retrieve an legend image that represents the layer.
		 * @returns {String}
		 */
		getLegendGraphicURL : function() {
			var queryParams = {
				request : 'GetLegendGraphic',
				format : 'image/png',
				layer : this.wmsParams.layers,
				sld : this.wmsParams.sld,
				VIEWPARAMS : this.wmsParams.VIEWPARAMS
			};
			return Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms?' + $.param(queryParams);
		},

		/*
		 * @returns {Jquery.Promise}
		 */
		fetchFeatureInBBox : function(bounds) {
			return $.ajax({
				url : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wfs',
				method: 'GET',
				data: {
					request: 'GetFeature',
					service: 'wfs',
					version: WFS_VERSION,
					typeNames: this.wmsParams.layers,
					VIEWPARAMS: this.wmsParams.VIEWPARAMS,
					outputFormat: 'application/json',
					bbox: WQP.L.Util.toBBoxString(bounds),
					count: 1
				}
			});
		}
	});

	L.coverageLayer = function(layerParams, options) {
		return new L.CoverageLayer(layerParams, options);
	};
})();