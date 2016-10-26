/* jslint browser: true */
/* global Config */
/* global L */
/* global _ */

var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

PORTAL.MODELS.nldiModel = (function() {
	"use strict";

	var self = {};

	var huc12FeatureSource = {
		id : 'huc12pp',
		text : 'HUC 12 pour point',
		mapLayer : L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
			layers:'fpp',
			styles : 'pour_points',
			format : 'image/png',
			transparent : true,
			minZoom : 8,
			zIndex : 20
		}),
		getFeatureInfoSource : {
			endpoint : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms',
			layerName : 'qw_portal_map:fpp',
			featureIdProperty : 'HUC_12'
		}
	};

	var nwisSitesFeatureSource = {
		id : 'nwissite',
		text : 'NWIS site',
		mapLayer : L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
			layers: 'qw_portal_map:nwis_sites',
			format : 'image/png',
			transparent : true,
			minZoom : 8,
			zIndex : 20
		}),
		getFeatureInfoSource : {
			endpoint : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms',
			layerName : 'qw_portal_map:nwis_sites',
			featureIdProperty : 'siteId'
		}
	};

	self.QUERY_SOURCES = [huc12FeatureSource, nwisSitesFeatureSource];
	self.NAVIGATION_MODES = [
		{id : 'UM', text : 'Upstream main'},
		{id : 'DM', text : 'Downstream main'},
		{id : 'UT', text : 'Upstream with tributaries'},
		{id : 'DD', text : 'Downstream with diversions'}
	];

	var modelData;

	self.reset = function() {
		modelData = {
			featureSource : undefined, // should be one of QUERY_SOURCES
			featureId : '',
			navigation : undefined, // Should be one of NAVIGATION_MODES
			distance : ''
		};
	};

	self.getData = function() {
		return modelData;
	};

	self.setData = function(property, value) {
		modelData[property] = value;
	};

	self.setFeatureSource = function(featureSourceId) {
		modelData.featureSource = _.find(self.QUERY_SOURCES, function(source) {
			return source.id === featureSourceId;
		});
	};

	self.getUrl = function(dataSource) {
		var result = '';
		var dataSourceString = (dataSource) ? '/' + dataSource : '';
		if (modelData.featureSource && modelData.featureId && modelData.navigation) {
			result = Config.NLDI_SERVICES_ENDPOINT + modelData.featureSource.id + '/' + modelData.featureId +
				'/navigate/' + modelData.navigation.id +
				dataSourceString +
				'?distance=' + modelData.distance;
		}
		return result;
	};

	// Initialize modelData
	self.reset();

	return self;

})();