var MapUtils = {};

MapUtils.XYZ_URL_POSTFIX = '${z}/${y}/${x}';

MapUtils.MERCATOR_PROJECTION = new OpenLayers.Projection("EPSG:900913");
MapUtils.WGS84_PROJECTION = new OpenLayers.Projection("EPSG:4326");

MapUtils.DEFAULT_CENTER = {
    lon: -82.5,
    lat: 48.2
};

// Set the maxResolutions and maxExtent as indicated in http://docs.openlayers.org/library/spherical_mercator.html
MapUtils.MAP_OPTIONS = {
    projection: MapUtils.MERCATOR_PROJECTION,
    maxResolution: 156543.0339,
    maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,20037508.34, 20037508.34),
//    restrictedExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,20037508.34, 20037508.34),
    controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.ArgParser(),
        new OpenLayers.Control.Attribution(),
        new OpenLayers.Control.Zoom(),
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.MousePosition({
            // Defined formatOutput because the displayProjection was not working.
            formatOutput: function(lonLat){
                lonLat.transform(MapUtils.MERCATOR_PROJECTION, MapUtils.WGS84_PROJECTION);
                return lonLat.toShortString();
            }
        }),
        new OpenLayers.Control.LayerSwitcher()
    ]
};

MapUtils.BASE_LAYERS = {
    light_grey_base : {
        type: OpenLayers.Layer.XYZ,
        name: 'World Light Gray',
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/' + MapUtils.XYZ_URL_POSTFIX
    },
    world_street: {
        type: OpenLayers.Layer.XYZ,
        name: 'World Street',
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/' + MapUtils.XYZ_URL_POSTFIX
    },
    world_imagery: {
        type: OpenLayers.Layer.XYZ,
        name: 'World Imagery',
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + MapUtils.XYZ_URL_POSTFIX
    },
    world_topo: {
        type: OpenLayers.Layer.XYZ,
        name: 'World Topo',
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/'+ MapUtils.XYZ_URL_POSTFIX
    },
    world_relief: {
        type: OpenLayers.Layer.XYZ,
        name: 'World Relief',
        url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/' + MapUtils.XYZ_URL_POSTFIX
    }
};

// Returns an OpenLayers layer described by layer which has at least type and name properties. A url property
// should be defined if necessary. The layer is created with the options.
MapUtils.getLayer = function(layer, options) {
    if (layer.type == OpenLayers.Layer.Stamen) {
        return new OpenLayers.Layer.Stamen(layer.name, options);
    }
    else {
        return new layer.type(layer.name, layer.url, options);
    }
}

/*
 * @ returns a promise which is resolved when the layer has been created. The
 *   layer is returned in the deferred's response
 */
MapUtils.getNWISSitesLayer = function(options, params) {
	options = options ? options : {};
	params = params ? params : {};
	var defaultOptions = {
		layers: 'NWC:gagesII',
		version: '1.1.1',
		format: 'image/png',
		transparent : true,
		tiled: true
	};
	var defaultParams = {
		isBaseLayer : false,
		displayInLayerSwitcher : true,
		visibility : false,
		singleTile : true // If sending an SLD_BODY parameter it must be a single tile.
	}
	
	var finalParams = $.extend({}, defaultParams, params);
	var finalOptions = $.extend({}, defaultOptions, options);
	
	var sldDeferred = $.Deferred();
	$.ajax({
		url : Config.NWIS_SITE_SLD_URL,
		dataType : 'text',
		success : function(data) {
			finalOptions.sld_body = data;
			sldDeferred.resolve(new OpenLayers.Layer.WMS(
					'NWIS Stream Gages',
					'http://cida.usgs.gov/nwc/proxy/geoserver/NWC/wms',
					finalOptions,
					finalParams
				)
			);
		},
		error : function() {
			sldDeferred.resolve(new OpenLayers.Layer.WMS(
					'NWIS Stream Gages',
					'http://cida.usgs.gov/nwc/proxy/geoserver/NWC/wms',
					finalOptions,
					finalParams
				)
			)
		}
	});
	return sldDeferred;
}

