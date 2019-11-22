import map from 'lodash/map';


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
 *      @prop {String} displayBy - spatial feature
 *      @prop {String} timeSpan - Allowed values: past_12_months, past_60_months, all_time
 *      @prop {String} dataSource - Allowed values: storet, nwis, all.
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

    /*
     * Redraws the layer to match the new layerParams
     * @param {Object} layerParams -
     *      @prop {String} displayBy - spatial feature
     *      @prop {String} timeSpan - Allowed values: past_12_months, past_60_months, all_time
     *      @prop {String} dataSource - Allowed values: storet, nwis, all.
     */
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
     * Retrieves using GetFeature service, the feature located at atLatLng
     * @param {L.LatLng} atLatLng
     * @returns {Jquery.Promise}
     *      @resolve - If the GetFeature request succeeds resolve with response. If only EPA or NWIS are
     *          requested, the response will only contain the DISCRETE_SAMPLE_COUNT.
     *      @reject - If the request fails, reject with the standard $.ajax error parameters
     */
    fetchFeatureAtLocation : function(atLatLng) {
        var deferred = $.Deferred();
        $.ajax({
            url : Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wfs',
            method: 'GET',
            data: {
                request: 'GetFeature',
                service: 'wfs',
                version: WFS_VERSION,
                typeNames: this.wmsParams.layers,
                VIEWPARAMS: this.wmsParams.VIEWPARAMS,
                outputFormat: 'application/json',
                cql_filter : 'CONTAINS(GEOM, SRID=4269;POINT (' + atLatLng.lat + ' ' + atLatLng.lng + '))'
            },
            success : function(resp) {
                if (this.wmsParams.VIEWPARAMS.search(VIEWPARAMS_SOURCE.nwis) !== -1 ||
                    this.wmsParams.VIEWPARAMS.search(VIEWPARAMS_SOURCE.storet) !== -1) {
                    resp.features = map(resp.features, function(feature) {
                        delete feature.properties.EPA_DISCRETE_SAMPLE_COUNT;
                        delete feature.properties.NWIS_DISCRETE_SAMPLE_COUNT;
                        return feature;
                    });
                }
                deferred.resolve(resp);
            },
            error : function(jqXHR, status, error) {
                deferred.reject(jqXHR, status, error);
            },
            context : this
        });

        return deferred.promise();
    }
});

L.coverageLayer = function(layerParams, options) {
    return new L.CoverageLayer(layerParams, options);
};
