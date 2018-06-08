import has from 'lodash/object/has';

import coverageMapPopup from '../hbTemplates/coverageMapPopup.hbs';


var COVERAGE = window.COVERAGE = window.COVERAGE || {};

/*
 * @param {Object} options
 *      @prop {String} mapDivId - Div where map will be rendered
 *      @prop {Jquery element} $legendImg - image element which will contain the legend
 *      @prop {Jquery element} $loadingIndicator - element then will be shown while the data layer is loaded.
 *      @prop {Object} layerParams -
 *          @prop {String} displayBy - spatial feature
 *          @prop {String} timeSpan - Allowed values: past_12_months, past_60_months, all_time
 *          @prop {String} dataSource - Allowed values: storet, nwis, all.
 */
COVERAGE.coverageMap = function(options) {
    var self = {};

    var BASE_LAYER_Z_INDEX = 1;
    var DATA_LAYER_Z_INDEX = 3;

    var MapWithSingleClickHandler = L.Map.extend({
        includes: L.singleClickEventMixin()
    });

    var getTitle = function (properties) {
        var result;
        if (has(properties, 'COUNTY_NAME')) {
            result = properties.COUNTY_NAME + ', ' + properties.STATE;
        } else if (has(properties, 'STATE')) {
            result = properties.STATE;
        } else {
            result = properties.HUC8;
        }
        return result;
    };


    var baseLayers = {
        'World Gray': L.esri.basemapLayer('Gray', {zIndex: BASE_LAYER_Z_INDEX}),
        'World Street': L.tileLayer.provider('Esri.WorldStreetMap', {zIndex: BASE_LAYER_Z_INDEX})
    };

    var dataLayer = L.coverageLayer(options.layerParams, {
        opacity: 0.6,
        zIndex: DATA_LAYER_Z_INDEX
    });

    var updateLegend = function () {
        options.$legendImg.attr('src', dataLayer.getLegendGraphicURL());
    };

    var map;
    var $mapDiv = $('#' + options.mapDivId);

    dataLayer.on('loading', function () {
        options.$loadingIndicator.show();
    });
    dataLayer.on('load', function () {
        options.$loadingIndicator.hide();
    });

    map = new MapWithSingleClickHandler(options.mapDivId, {
        center: [37.0, -100.0],
        zoom: 3,
        layers: [baseLayers['World Gray'], dataLayer]
    });

    map.addControl(L.control.layers(baseLayers), {}, {
        autoZIndex: false
    });
    updateLegend();

    map.addSingleClickHandler(function (ev) {
        var popup = L.popup().setLatLng(ev.latlng);
        var currentCursor = $mapDiv.css('cursor');
        // The following cleans up the event handler for the zoom button
        popup.on('popupclose', function() {
            $('coverage-map-popup').off();
        });
        $mapDiv.css('cursor', 'progress');
        dataLayer.fetchFeatureAtLocation(ev.latlng)
            .done(function (resp) {
                var context;
                var content = '';
                if (resp.features.length > 0) {
                    context = resp.features[0].properties;
                    context.title = getTitle(resp.features[0].properties);
                    content = coverageMapPopup(context);
                } else {
                    content = 'Did not find a coverage map feature. \n Please click within a feature';
                }
                popup.setContent(content).openOn(map);
                $('#coverage-map-popup').on('click', function() {
                    var corner1 = L.latLng(resp.bbox[0], resp.bbox[1]);
                    var corner2 = L.latLng(resp.bbox[2], resp.bbox[3]);
                    map.fitBounds(L.latLngBounds(corner1, corner2));
                });
            })
            .fail(function () {
                popup.setContent('Get Feature request failed').openOn(map);
            })
            .always(function() {
                $mapDiv.css('cursor', currentCursor);
            });
    });


    self.updateDataLayer = function (layerParams) {
        dataLayer.updateLayerParams(layerParams);
        updateLegend();
    };

    return self;
};
