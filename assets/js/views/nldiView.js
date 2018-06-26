import log from 'loglevel';
import partial from 'lodash/function/partial';

import NldiNavPopupView from './nldiNavPopupView';
import * as nldiModel from '../nldiModel';
import { getAnchorQueryValues } from '../utils';

/*
 * Creates the NHLD maps, an inset map and a larger map. Only one of the maps is shown.
 * The map shown is changed by clicking the expand/collapse control in the upper right of each map.
 * Each map also contains the Navigation selector.
 * @param {Object} options
 *      @prop {String} this.insetMapDivId
 *      @prop {String} mapDivId
 *      @prop {Jquery element} $input
 */
export default class NldiView {
    constructor({insetMapDivId, mapDivId, $input}) {
        this.insetMapDivId = insetMapDivId;
        this.mapDivId = mapDivId;
        this.$input = $input;

        this.$mapDiv = $('#' + mapDivId);
        this.$insetMapDiv = $('#' + insetMapDivId);

        /* Functions return a geoJson layer with predefined options for flowLine and site layers respectively */
        this.flowlineLayer = partial(L.geoJson);
        this.siteLayer = partial(L.geoJson, partial.placeholder, {
            pointToLayer: function (featureData, latlng) {
                return L.circleMarker(latlng, {
                    radius: 5,
                    fillColor: '#ff3300',
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }
        });

        // Add change handler for the hidden input so the NLDI can be cleared on a reset
        this.$input.change(() => {
           if (!this.$input.val()) {
               this.clearHandler();
           }
        });
    }

    getRetrieveMessage() {
        const nldiData = nldiModel.getData();
        return '<p>Retrieving sites ' + nldiData.navigation.text.toLowerCase() + (nldiData.distance ? ' ' + nldiData.distance + ' km' : '') + '.</p>';
    }

    cleanUpMaps() {
        if (this.nldiSiteCluster) {
            this.nldiSiteCluster.clearLayers();
            this.map.removeLayer(this.nldiSiteCluster);
        }
        if (this.nldiFlowlineLayers) {
            this.map.removeLayer(this.nldiFlowlineLayers);
        }
        if (this.insetNldiSiteCluster) {
            this.insetNldiSiteCluster.clearLayers();
            this.insetMap.removeLayer(this.insetNldiSiteCluster);
        }
        if (this.insetNldiFlowlineLayers) {
            this.insetMap.removeLayer(this.insetNldiFlowlineLayers);
        }

        this.updateNldiInput('');
    }

    updateNldiInput(url) {
        // Only trigger a change if non-null url or if the $input.val is being changed from an url to null
        if (url || this.$input.val()) {
            this.$input.val(url).trigger('change');
        }
    }

    /*
     * @param {L.Point} point - This is the containerPoint where we are looking for a feature from the pour point endpoint
     * @returns $Deferred.promise
     *      @resolve - Returns {Object} - the json data received from the request
     *      @reject - If unable to fetch the pour point
     */
    fetchFeatureId(point) {
        const mapBounds = this.map.getBounds();
        const nldiFeatureSource = nldiModel.getData().featureSource.getFeatureInfoSource;
        return $.ajax({
            url : nldiFeatureSource.endpoint,
            method : 'GET',
            data : {
                version: '1.3.0',
                request: 'GetFeatureInfo',
                service: 'wms',
                layers : nldiFeatureSource.layerName,
                srs : 'EPSG:4326',
                bbox : mapBounds.getSouth() + ',' + mapBounds.getWest() + ',' + mapBounds.getNorth() + ',' + mapBounds.getEast(),
                width : this.map.getSize().x,
                height : this.map.getSize().y,
                'info_format' : 'application/json',
                'query_layers' : nldiFeatureSource.layerName,
                i : point.x,
                j : point.y
            }
        });
    }


    /*
     * Retrieve the NLDI sites and flow lines for the current state of nldiModel and
     * display them on both the this.insetMap and map.
     */
    updateNldiSites() {
        const nldiSiteUrl = nldiModel.getUrl('wqp');
        const nldiFlowlinesUrl = nldiModel.getUrl();

        const fetchNldiSites = function() {
            return $.ajax({
                url : nldiSiteUrl,
                method : 'GET'
            });
        };
        const fetchNldiFlowlines = function() {
            return $.ajax({
                url : nldiFlowlinesUrl,
                method : 'GET'
            });
        };
        if (nldiSiteUrl) {
            this.$mapDiv.css('cursor', 'progress');
            $.when(fetchNldiSites(), fetchNldiFlowlines())
                .done((sitesResponse, flowlinesResponse) => {
                    let flowlineBounds;
                    const sitesGeojson = sitesResponse[0];
                    const flowlinesGeojson = flowlinesResponse[0];

                    // These layers go into the siteCluster layer
                    const nldiSiteLayers = this.siteLayer(sitesGeojson);
                    const insetNldiSiteLayers = this.siteLayer(sitesGeojson);

                    log.debug('NLDI service has retrieved ' + sitesGeojson.features.length + ' sites.');
                    this.map.closePopup();

                    this.nldiFlowlineLayers = this.flowlineLayer(flowlinesGeojson);
                    this.insetNldiFlowlineLayers = this.flowlineLayer(flowlinesGeojson);
                    this.map.addLayer(this.nldiFlowlineLayers);
                    this.insetMap.addLayer(this.insetNldiFlowlineLayers);

                    flowlineBounds = this.nldiFlowlineLayers.getBounds();
                    this.map.fitBounds(flowlineBounds);
                    this.insetMap.fitBounds(flowlineBounds);

                    this.nldiSiteCluster = L.markerClusterGroup({
                        maxClusterRadius : 40
                    });
                    this.insetNldiSiteCluster = L.markerClusterGroup();

                    this.nldiSiteCluster.addLayer(nldiSiteLayers);
                    this.insetNldiSiteCluster.addLayer(insetNldiSiteLayers);
                    this.map.addLayer(this.nldiSiteCluster);
                    this.insetMap.addLayer(this.insetNldiSiteCluster);

                    this.updateNldiInput(nldiModel.getUrl('wqp'));
                })
                .fail(() => {
                    this.map.openPopup('Unable to retrieve NLDI information', this.map.getCenter());
                    this.updateNldiInput('');
                })
                .always(() => {
                    this.$mapDiv.css('cursor', '');
                });
        }
    }

    /*
     * Leaflet mouse event handler to find the sites associated with the feature source at the location in the event.
     * Popups are used to tell the user if an error occurred in the process. If a feature source is located, the popup
     * displayed will allow the user to perform an NLDI navigation using parameters entered in the popup.
     *
     * @param {L.MouseEvent} ev
     */
    findSitesHandler(ev) {
        const featureIdProperty = nldiModel.getData().featureSource.getFeatureInfoSource.featureIdProperty;

        log.debug('Clicked at location: ' + ev.latlng.toString());
        this.$mapDiv.css('cursor', 'progress');

        nldiModel.setData('featureId', '');
        nldiModel.setData('navigation', undefined);
        nldiModel.setData('distance', '');
        this.cleanUpMaps();
        this.map.closePopup();

        this.fetchFeatureId(ev.containerPoint.round())
            .done((result) => {
                const navHandler = () => {
                    this.map.openPopup(this.getRetrieveMessage(), ev.latlng);
                    this.updateNldiSites();
                };

                if (result.features.length === 0) {
                    this.map.openPopup('<p>No query point has been selected. Please click on a point to query from.</p>', ev.latlng);

                } else if (result.features.length > 1) {
                    this.map.openPopup('<p>More than one query point has been selected. Please zoom in and try again.</p>', ev.latlng);
                } else {
                    nldiModel.setData('featureId',
                        result.features[0].properties[featureIdProperty]);

                    new NldiNavPopupView(this.map, result.features[0], ev.latlng, navHandler);
                }
            })
            .fail(() => {
                this.map.openPopup('<p>Unable to retrieve points, service call failed</p>', ev.latlng);
            })
            .always(() => {
                this.$mapDiv.css('cursor', '');
            });
    }

    /*
     * Show the full size map and  hide the inset map
     */
    showMap() {
        if (this.$mapDiv.is(':hidden')) {
            this.$insetMapDiv.hide();
            this.$mapDiv.parent().show();
            this.map.invalidateSize();
            this.map.setView(this.insetMap.getCenter(), this.insetMap.getZoom());
        }
        this.map.closePopup();
    }

    /*
     * Show the inset map and hide the full size map
     */
    showInsetMap() {
        if (this.$insetMapDiv.is(':hidden')) {
            this.$insetMapDiv.show();
            this.$mapDiv.parent().hide();
            this.insetMap.invalidateSize();
            this.insetMap.setView(this.map.getCenter(), this.map.getZoom());
        }
    }

    featureSourceChangeHandler(ev) {
        this.cleanUpMaps();
        this.map.closePopup();
        nldiModel.setFeatureSource($(ev.currentTarget).val());
    }

    clearHandler() {
        nldiModel.reset();
        this.cleanUpMaps();
        this.map.closePopup();
    }

    /*
     * Initialize the inset and full size maps.
     */
    initialize() {

        const initValues = getAnchorQueryValues(this.$input.attr('name'));

        const insetBaseLayers = {
            'World Gray' : L.esri.basemapLayer('Gray')
        };
        const insetHydroLayer = L.esri.tiledMapLayer({
            url : Config.HYDRO_LAYER_ENDPOINT
        });

        const baseLayers = {
            'World Gray' : L.esri.basemapLayer('Gray'),
            'World Topo' : L.tileLayer.provider('Esri.WorldTopoMap'),
            'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
            'World Relief' : L.tileLayer.provider('Esri.WorldShadedRelief'),
            'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
        };
        const hydroLayer = L.esri.tiledMapLayer({
            url : Config.HYDRO_LAYER_ENDPOINT
        });
        const nhdlPlusFlowlineLayer = L.tileLayer.wms(Config.NHDPLUS_FLOWLINE_ENDPOINT,
            {
                layers : Config.NHDPLUS_FLOWLINE_LAYER_NAME,
                format : 'image/png',
                transparent : true,
                opacity : 0.5
            }
        );

        const featureSourceSelectControl = L.control.featureSourceSelectControl({
            changeHandler : this.featureSourceChangeHandler.bind(this),
            featureSourceOptions : nldiModel.FEATURE_SOURCES,
            initialFeatureSourceValue : nldiModel.getData().featureSource.id
        });

        const searchControl = L.control.searchControl(Config.GEO_SEARCH_API_ENDPOINT);

        const expandControl = L.easyButton('fa-lg fa-expand', this.showMap.bind(this), 'Expand NLDI Map', {
            position : 'topright'
        });
        const collapseControl = L.easyButton('fa-lg fa-compress', this.showInsetMap.bind(this), 'Collapse NLDI Map', {
            position: 'topright'
        });
        const insetClearControl = L.easyButton('fa-lg fa-undo', this.clearHandler.bind(this), 'Clear the sites', {
            position: 'topleft'
        });
        const clearControl = L.easyButton('fa-lg fa-undo', this.clearHandler.bind(this), 'Clear the sites', {
            position: 'topleft'
        });

        const MapWithSingleClickHandler = L.Map.extend({
            includes : L.singleClickEventMixin()
        });

        this.insetMap = L.map(this.insetMapDivId, {
            center: [37.0, -100.0],
            zoom : 3,
            layers : [insetBaseLayers['World Gray']],
            scrollWheelZoom : false,
            zoomControl : false
        });
        this.insetMap.addLayer(insetHydroLayer);
        this.insetMap.addControl(expandControl);
        this.insetMap.addControl(insetClearControl);
        this.insetMap.addControl(L.control.zoom());

        this.map = new MapWithSingleClickHandler(this.mapDivId, {
            center: [37.0, -100.0],
            zoom : 3,
            layers : [baseLayers['World Topo'], hydroLayer, nhdlPlusFlowlineLayer],
            zoomControl : false
        });

        this.map.addControl(searchControl);
        this.map.addControl(featureSourceSelectControl);
        this.map.addControl(collapseControl);
        this.map.addControl(L.control.layers(baseLayers, {
            'Hydro Reference' : hydroLayer,
            'NHDLPlus Flowline Network' : nhdlPlusFlowlineLayer
        }));
        this.map.addControl(clearControl);
        this.map.addControl(L.control.zoom());

        this.map.addSingleClickHandler(this.findSitesHandler.bind(this));

        if (initValues.length === 1) {
            nldiModel.setDataFromUrl(initValues[0]);
            this.updateNldiSites();
        }
    }
}
