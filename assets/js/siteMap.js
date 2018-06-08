import { isExtraSmallBrowser } from './utils';


const BASE_LAYER_Z_INDEX = 1;
const HYDRO_LAYER_Z_INDEX = 2;
const NWIS_SITES_LAYER_Z_INDEX = 3;
const WQP_SITES_LAYER_Z_INDEX = 4;


/*
 * Manages the site map and its controls
 * @param {Object} options
 *      @prop {String} mapDivId
 *      @prop {Jquery element} $loadingIndicator
 *      @prop {Jquery element} $legendDiv
 *      @prop {Jquery element} $sldSelect
 *      @prop {Object instance of IdentifyDialog} identifyDialog
 * @return {Object}
 *      @func initialize
 *      @func render
 *      @func addSitesLayer
 *      @func clearBoxIdFeature
 */
export default class SiteMap {

    constructor({mapDivId, $loadingIndicator, $legendDiv, $sldSelect, identifyDialog}) {
        this.mapDivId = mapDivId;
        this.$loadingIndicator = $loadingIndicator;
        this.$legendDiv = $legendDiv;
        this.$sldSelect = $sldSelect;
        this.identifyDialog = identifyDialog;
    }

    /*
     * Create the site map, with the base layers, overlay layers, and identify controls and event handlers.
     * Should be called before any of the other methods in this object.
     */
    initialize() {
        var MapWithSingleClickHandler = L.Map.extend({
            includes: L.singleClickEventMixin()
        });
        var baseLayers = {
            'World Topo': L.tileLayer.provider('Esri.WorldTopoMap', {zIndex: BASE_LAYER_Z_INDEX}),
            'World Street': L.tileLayer.provider('Esri.WorldStreetMap', {zIndex: BASE_LAYER_Z_INDEX}),
            'World Relief': L.tileLayer.provider('Esri.WorldShadedRelief', {zIndex: BASE_LAYER_Z_INDEX}),
            'World Imagery': L.tileLayer.provider('Esri.WorldImagery', {zIndex: BASE_LAYER_Z_INDEX})
        };
        var esriHydroLayer = L.esri.tiledMapLayer({
            url: Config.HYDRO_LAYER_ENDPOINT,
            zIndex: HYDRO_LAYER_Z_INDEX
        });
        var nwisSitesLayer = L.tileLayer.wms(Config.WQP_MAP_GEOSERVER_ENDPOINT + 'wms', {
            layers: 'qw_portal_map:nwis_sites',
            format: 'image/png',
            transparent: true,
            zIndex: NWIS_SITES_LAYER_Z_INDEX
        });
        var drawIdentifyBoxControl;

        var updateIdentifyDialog = (bounds) => {
            if (this.wqpSitesLayer) {
                this.$loadingIndicator.show();
                this.wqpSitesLayer.fetchSitesInBBox(bounds)
                    .done((resp) => {
                        this.identifyDialog.showDialog({
                            features: resp.features,
                            queryParamArray: this.wqpSitesLayer.getQueryParamArray(),
                            boundingBox: bounds.toBBoxString(),
                            usePopover: isExtraSmallBrowser()
                        });
                    })
                    .fail(() => {
                        this.map.openPopup('Failed to fetch sites', this.map.getCenter());
                    })
                    .always(() => {
                        this.$loadingIndicator.hide();
                    });
            }
        };

        var identifySitesAtPointHandler = (ev) => {
            var southwestPoint = L.point(ev.layerPoint.x - 5, ev.layerPoint.y - 5);
            var northeastPoint = L.point(ev.layerPoint.x + 5, ev.layerPoint.y + 5);
            var bounds = L.latLngBounds(
                this.map.layerPointToLatLng(southwestPoint),
                this.map.layerPointToLatLng(northeastPoint)
            );
            updateIdentifyDialog(bounds);
        };

        var drawIdentifyBox = (layer) => {
            this.drawnIdentifyBoxFeature.clearLayers();
            this.drawnIdentifyBoxFeature.addLayer(layer);
            updateIdentifyDialog(layer.getBounds());
        };

        this.drawnIdentifyBoxFeature = L.featureGroup();
        L.drawLocal.draw.toolbar.buttons.rectangle = 'Click to identify sites in a box';
        L.drawLocal.edit.toolbar.buttons.edit = 'Click to modify identify box';
        drawIdentifyBoxControl = new L.Control.Draw({
            draw: {
                polyline: false,
                polygon: false,
                rectangle: {
                    repeatMode: false
                },
                circle: false,
                marker: false
            },
            edit: {
                featureGroup: this.drawnIdentifyBoxFeature,
                remove: false
            }
        });

        this.map = new MapWithSingleClickHandler(this.mapDivId, {
            center: [37.0, -100.0],
            zoom: 3,
            layers: [baseLayers['World Topo'], esriHydroLayer]
        });

        this.map.addControl(L.control.layers(baseLayers, {
            'ESRI Hyro Layer': esriHydroLayer,
            'NWIS Stream Gages': nwisSitesLayer
        }, {
            autoZIndex: false
        }));
        this.map.addControl(L.control.scale());
        this.map.addLayer(this.drawnIdentifyBoxFeature);
        this.map.addControl(drawIdentifyBoxControl);

        // Set up the map event handlers for the draw control to retrieve the sites.
        this.map.on(L.Draw.Event.CREATED, (ev) => {
            drawIdentifyBox(ev.layer);
        });
        this.map.on(L.Draw.Event.EDITED, (ev) => {
            drawIdentifyBox(ev.layers.getLayers()[0]);
        });

        // Set up click handler for the identify click event
        this.map.addSingleClickHandler(identifySitesAtPointHandler);

        //Set up sld switcher
        this.$sldSelect.change(() => {
            if (this.wqpSitesLayer) {
                this.wqpSitesLayer.setParams({
                    styles: this.$sldSelect.val()
                });
            }
        });
    }

    /*
     * Renders the map this.mapDivId if initialize has been called
     */
    render() {
        if (this.map) {
            this.map.invalidateSize();
            this.map.setView(this.map.getCenter(), this.map.getZoom());
        }
    }

    /*
     * Show the loading indicator, create the sites layer for the query parameters, and show
     * on the this.map. The loading indicator should be removed once the layer has been completely loaded.
     * @param {Array of Object with name and value properties} queryParamArray - query parameters to be used to retrieve the sites
     */

    updateSitesLayer(queryParamArray) {
        if (this.map) {
            //this.$loadingIndicator.show();
            if (this.wqpSitesLayer) {
                this.wqpSitesLayer.updateQueryParams(queryParamArray);
            } else {
                this.wqpSitesLayer = L.this.wqpSitesLayer(queryParamArray, {
                    styles: this.$sldSelect.val(),
                    zIndex: WQP_SITES_LAYER_Z_INDEX
                });
                this.wqpSitesLayer.on('loading', () => {
                    this.$loadingIndicator.show();
                });
                this.wqpSitesLayer.on('load', () => {
                    this.$loadingIndicator.hide();
                    this.wqpSitesLayer.getLegendGraphic((src) => {
                        this.$legendDiv.html('<img  src="' + src + '" />');
                    });
                });
                this.map.addLayer(this.wqpSitesLayer);
            }
        }
    }

    clearBoxIdFeature() {
        this.drawnIdentifyBoxFeature.clearLayers();
    }
}
