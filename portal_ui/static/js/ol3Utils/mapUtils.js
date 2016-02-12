/* jslint browser: true */
/* global ol */
/* global Config */
/* global $ */
/* global _ */
/* global PORTAL */
/* global log */

var WQP = WQP || {};

WQP.ol3 = WQP.ol3 || {};

WQP.ol3.mapUtils = (function() {
	"use strict";

	var self = {};

	var getSearchParams = function (queryParamArray) {
			var queryString = PORTAL.UTILS.getQueryString(queryParamArray, ['mimeType', 'zip'], true);
			var result = decodeURIComponent(queryString.replace(/\+/g, '%20'));
			return result.replace(/=/g, ':').replace(/;/g, '|').replace(/&/g, ';');
		};


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
			LAYERS: 'NWC:gagesII',
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
				url : 'http://cida.usgs.gov/nwc/proxygeoserver/NWC/wms', //TODO: Put in config parameters
			});

			finalLayerOptions.source = layerSource;
			getLayerDeferred.resolve(new ol.layer.Tile(finalLayerOptions));
		});
		return getLayerDeferred.promise();
	};

	self.createWQPSitesLayer = function(queryParamArray, wmsParams, layerOptions) {
		var URL = Config.SITES_GEOSERVER_ENDPOINT + 'wms';
		var sourceWMSParams = {
			LAYERS: 'wqp_sites',
			STYLES : 'wqp_sources',
			FORMAT : 'image/png',
			TRANSPARENT : true,
			SEARCHPARAMS : getSearchParams(queryParamArray),
			VERSION: '1.1.0'
		};
		var siteLayerOptions = {
			title : 'WQP Sites',
			queryParamArray : queryParamArray,
			visible : true,
			source : new ol.source.TileWMS({
				params : _.extend({}, wmsParams, sourceWMSParams),
				url : URL
			})
		};

		return new ol.layer.Tile(_.extend({}, layerOptions, siteLayerOptions));
	};

	self.getWQPSitesFeature = function(searchParams, boundingBox) {
		var deferred = $.Deferred();
		var wfsFormat = new ol.format.WFS();
		var gmlFormat = new ol.format.GML({
			srsName : 'EPSG:900913'
		});
		var getFeatureQueryDoc = wfsFormat.writeGetFeature({
			featureNS: '',
			featurePrefix : '',
			featureTypes : ['wqp_sites'],
			outputFormat : 'application/json',
			maxFeatures : 20,
			srsName : 'EPSG:900913',
			geometryName : 'the_geom',
			bbox :	boundingBox
		});
		var $getFeature = $(getFeatureQueryDoc);
		var $filter = $getFeature.find('Filter');
		$getFeature.remove('BBOX');
		$getFeature.find('Filter').html(
			'<And><PropertyIsEqualTo matchCase="true">'  +
			'<PropertyName>searchParams</PropertyName>' +
			'<Literal>' + encodeURIComponent(searchParams) + '</Literal>' +
			'</PropertyIsEqualTo>' + $filter.html() + '</And>'
		);
		var getFeatureDoc = '<GetFeature xmlns="http://www.opengis.net/wfs" ' +
			'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" service="WFS" version="1.1.0" ' +
			'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">' +
			$(getFeatureQueryDoc).html() +
			'</GetFeature>';

		$.ajax({
			url : Config.SITES_GEOSERVER_ENDPOINT + 'wfs',
			data : getFeatureDoc,
			method : 'POST',
			contentType : 'application/xml',

			success : function(response) {
				if ($(response).find('ExceptionReport, ows\\:ExceptionReport').length > 0) {
					log.error('WFS received an error response');
					deferred.reject('WFS request failed');
				}
				else {
					deferred.resolve(gmlFormat.readFeatures(response));
					log.debug('Got response');
				}
			},
			error : function(jqXHR, textStatus, error) {
				log.error('Error is ' + textStatus);
				deferred.reject('WFS service is not working');
			}
		});

		return deferred.promise();

	};

	return self;

})();