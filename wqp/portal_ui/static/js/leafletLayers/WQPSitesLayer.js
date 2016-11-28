/* jslint browser: true */

/* global L */
/* global PORTAL */
/* global WQP */
/* global Config */
/* global _ */
/* global $ */

(function() {
	"use strict";

	var LAYER_NAME = 'wqp_sites';
	var WMS_VERSION = '1.1.0';
	var WFS_VERSION = '2.0.0';

	var getSearchParams = function(queryParamArray) {
		var queryJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
		var resultJson = _.omit(queryJson, ['mimeType', 'zip']);
		resultJson = _.mapObject(resultJson, function(value) {
			return value.join('|');
		});
		var resultArray =  _.map(resultJson, function(value, name) {
			return name + ':' + value;
		});
		return resultArray.join(';');
	};

	/*
	 * @constructs - extends L.TileLayer.WMS
	 * The url should not be passed into the constructor. The layers, format, transparent, and version options are
	 * defaulted.
	 * @param {Array of Object with name and value properties representing a WQP site query} queryParamArray}
	 * @param {Object} options - Can be any L.TileLayer.WMS
	 */
	L.WQPSitesLayer = L.TileLayer.WMS.extend({

		defaultWmsParams : {
			SEARCHPARAMS : '',
			layers : LAYER_NAME,
			format : 'image/png',
			transparent : true,
			version : WMS_VERSION,
			request : 'GetMap'
		},

		initialize : function(queryParamArray, options) {
			this.queryParamArray = queryParamArray;
			L.TileLayer.WMS.prototype.initialize.call(this, Config.SITES_GEOSERVER_ENDPOINT + 'wms', options);

			this.wmsParams.SEARCHPARAMS = getSearchParams((queryParamArray));
		},

		getQueryParamArray : function() {
			return this.queryParamArray;
		},

		/*
		 * Updates the layer to show the sites represented by queryParamArray
		 * @param {Array of Objects with name and value properties} queryParamArray - This represents the query
		 * 		parameters for the sites that we want to see.
		 */
		updateQueryParams : function(queryParamArray) {
			this.setParams({
				SEARCHPARAMS : getSearchParams(queryParamArray),
				cacheId : Date.now() // Needed to prevent a cached layer from being used.
			});
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
				style : this.wmsParams.styles,
				SEARCHPARAMS : this.wmsParams.SEARCHPARAMS,
				legend_options : 'fontStyle:bold'
			};
			return Config.SITES_GEOSERVER_ENDPOINT + 'wms?' + $.param(queryParams);
		},

		/*
		 * @param {L.LatLngBounds} bounds
		 * @returns {Jquery.Promise}
		 * 		@resolve: Returns the received json data for the features within bounds for the
		 * 			currently displayed layer.
		 *		@reject: Returns the jqXHR response.
		 */
		fetchSitesInBBox : function(bounds) {
			return $.ajax({
				url : L.WQPSitesLayer.getWfsGetFeatureUrl(this.queryParamArray) + '&bbox=' + WQP.L.Util.toBBoxString(bounds),
				method : 'GET'
			});
		}
	});

	L.extend(L.WQPSitesLayer, {
		/*
		 * @static
		 * @returns {String} - Url which can be used to retrieve json feature information using WFS GetFeature.
		 */
		getWfsGetFeatureUrl : function(queryParamArray) {
			var queryData = {
				request : 'GetFeature',
				service : 'wfs',
				version : WFS_VERSION,
				typeNames : LAYER_NAME,
				SEARCHPARAMS : getSearchParams(queryParamArray),
				outputFormat : 'application/json'
			};

			return Config.SITES_GEOSERVER_ENDPOINT  + 'wfs/?' + $.param(queryData);
		}
	});

	L.wqpSitesLayer = function(queryParamArray, options) {
		return new L.WQPSitesLayer(queryParamArray, options);
	};

})();