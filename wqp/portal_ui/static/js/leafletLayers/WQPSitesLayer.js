/* jslint browser: true */

/* global L */
/* global PORTAL */
/* global Config */
/* global _ */
/* global $ */

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
		layers : 'wqp_sites',
		format : 'image/png',
		transparent : true,
		version : '1.1.0',
		request : 'GetMap'
	},

	_getSearchParams : function(queryParamArray) {
		"use strict";
		var queryJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
		var resultJson = _.omit(queryJson, ['mimeType', 'zip']);
		resultJson = _.mapObject(resultJson, function(value) {
			return value.join('|');
		});
		var resultArray =  _.map(resultJson, function(value, name) {
			return name + ':' + value;
		});
		return resultArray.join(';');
	},

	initialize : function(queryParamArray, options) {
		"use strict";
		L.TileLayer.WMS.prototype.initialize.call(this, Config.SITES_GEOSERVER_ENDPOINT + 'wms', options);

		this.wmsParams.SEARCHPARAMS = this._getSearchParams((queryParamArray));
	},

	updateQueryParams : function(queryParamArray) {
		"use strict";
		this.setParams({
			SEARCHPARAMS : this._getSearchParams(queryParamArray),
			cacheId : Date.now() // Needed to prevent a cached layer from being used.
		});
	},

	getLegendGraphicURL : function() {
		"use strict";

		var queryParams = {
			request : 'GetLegendGraphic',
			format : 'image/png',
			layer : this.wmsParams.layers,
			style : this.wmsParams.styles,
			SEARCHPARAMS : this.wmsParams.SEARCHPARAMS,
			legend_options : 'fontStyle:bold'
		};
		return Config.SITES_GEOSERVER_ENDPOINT + 'wms?' + $.param(queryParams);
	}
});

L.wqpSitesLayer = function(queryParamArray, options) {
	"use strict";
	return new L.WQPSitesLayer(queryParamArray, options);
};