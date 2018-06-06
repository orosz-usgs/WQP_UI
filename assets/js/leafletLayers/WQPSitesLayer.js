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

			this.wmsParams.SEARCHPARAMS = L.WQPSitesLayer.getSearchParams((queryParamArray));
		},

		getQueryParamArray : function() {
			return this.queryParamArray;
		},

		_getImageSrc : function(url, done) {
			var accessToken = PORTAL.UTILS.getCookie('access_token');
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'blob';
			if (accessToken) {
				xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
			}
			xhr.onload = function() {
				var reader = new FileReader();
				reader.readAsDataURL(this.response);
				reader.onloadend = function() {
					done(reader.result);
				};
			};
			xhr.send();
		},

		createTile: function(coords, done) {
			var url = this.getTileUrl(coords);
			var img = document.createElement('img');
			this._getImageSrc(url, function(src) {
				img.src = src;
				done();
			});

			return img;
		},

		/*
		 * Updates the layer to show the sites represented by queryParamArray
		 * @param {Array of Objects with name and value properties} queryParamArray - This represents the query
		 * 		parameters for the sites that we want to see.
		 */
		updateQueryParams : function(queryParamArray) {
			this.queryParamArray = queryParamArray;
			this.setParams({
				SEARCHPARAMS : L.WQPSitesLayer.getSearchParams(queryParamArray),
				cacheId : Date.now() // Needed to prevent a cached layer from being used.
			});
		},

		/*
		 * Returns an png image which can be used to display the image that represents the layer.
		 * @returns {String}
		 */
		getLegendGraphic : function(done) {
			var queryParams = {
				request : 'GetLegendGraphic',
				format : 'image/png',
				layer : this.wmsParams.layers,
				style : this.wmsParams.styles,
				SEARCHPARAMS : this.wmsParams.SEARCHPARAMS,
				legend_options : 'fontStyle:bold;forceLabels:on'
			};

			if (this.wmsParams.styles === 'activity_visual') {
				queryParams.WIDTH = 50;
				queryParams.HEIGHT = 45;
			}
			this._getImageSrc(Config.SITES_GEOSERVER_ENDPOINT + 'wms?' + $.param(queryParams), done);
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
		 * @param {Array of Object} queryParamArray - each object contains name, value, and multiple properties.
		 * @returns {String} - Returns the value of the SEARCHPARAMS query parameter that is sent in OGC request
		 */
		getSearchParams: function (queryParamArray) {
			var queryJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
			var resultJson = _.omit(queryJson, ['mimeType', 'zip']);
			resultJson = _.mapObject(resultJson, function(value) {
				if (typeof value === 'string') {
					return value;
				} else {
					return value.join('|');
				}
			});
			var resultArray = _.map(resultJson, function (value, name) {
				return name + ':' + value;
			});
			return resultArray.join(';');
		},

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
				SEARCHPARAMS : L.WQPSitesLayer.getSearchParams(queryParamArray),
				outputFormat : 'application/json'
			};

			return Config.SITES_GEOSERVER_ENDPOINT + 'wfs/?' + $.param(queryData);
		}
	});

	L.wqpSitesLayer = function(queryParamArray, options) {
		return new L.WQPSitesLayer(queryParamArray, options);
	};

})();