import filter from 'lodash/collection/filter';


var MAP_ID = 'query-results-map';
var STATION_RESULTS = 'Station';

/*
 * Managed the Site map and its controls.
 * @param {Object} options
 *      @param {Jquery element} $container - contains the map and its controls
 *      @param {DownloadProgressDialog} downloadProgressDialog
 *      @param {PORTAL.VIEWS.downloadFormView} downloadFormView
 * @return {Object}
    *   @func initialize
 */
export default class SiteMapView {
    constructor({$container, downloadProgressDialog, downloadFormView}) {
        this.$container = $container;
        this.downloadProgressDialog = downloadProgressDialog;
        this.downloadFormView = downloadFormView;
    }

    /*
     * Initialize the site map and all of it's controls
     */
    initialize() {
        this.identifyDialog = PORTAL.VIEWS.identifyDialog({
            $dialog : $('#map-info-dialog'),
            $popover : this.$container.find('#map-popover')
        });
        this.portalDataMap = PORTAL.MAP.siteMap({
            mapDivId : MAP_ID,
            $loadingIndicator : this.$container.find('#map-loading-indicator'),
            $legendDiv : this.$container.find('#query-map-legend-div .legend-container'),
            $sldSelect : this.$container.find('#sld-select-input'),
            identifyDialog : this.identifyDialog
        });

        var $mapContainer = this.$container.find('#query-map-container');
        var $legendContainer = this.$container.find('#query-map-legend-div');
        var $map = this.$container.find('#' + MAP_ID);
        var $showHideBtn = this.$container.find('.show-hide-toggle');

        // The map div's height should always be set to the height its parent div.
        // OpenLayers will not draw the layer if the height of the map div is not set explictly.
        $map.height($mapContainer.height());
        $(window).resize(() => {
            var mapContainerHeight = $mapContainer.height();

            if (mapContainerHeight !== $map.height()) {
                $map.height(mapContainerHeight);
            }
        });

        this.identifyDialog.initialize(this.portalDataMap.clearBoxIdFeature);
        this.portalDataMap.initialize();

        // Add click handler for map show/hide button
        $showHideBtn.click((event) => {
            var isVisible = PORTAL.UTILS.toggleShowHideSections($(event.currentTarget), $mapContainer);
            if (isVisible) {
                this.portalDataMap.render();
                $legendContainer.show();
            } else {
                $legendContainer.hide();
            }
        });

        // Add click handler for Show Sites button
        this.$container.find('#show-on-map-button').click(() => {
            var queryParamArray = this.downloadFormView.getQueryParamArray();
            var queryString = PORTAL.UTILS.getQueryString(queryParamArray);
            var siteIds = filter(queryParamArray, (param) => {
                return param.name === 'siteid';
            });

            var showMap = (totalCount) => {
                // Show the map if it is currently hidden
                if ($mapContainer.is(':hidden')) {
                    $showHideBtn.click();
                }

                window._gaq.push([
                    '_trackEvent',
                    'Portal Map',
                    'MapCreate',
                    decodeURIComponent(queryString),
                    parseInt(totalCount)
                ]);

                this.portalDataMap.updateSitesLayer(queryParamArray);
            };

            if (!this.downloadFormView.validateDownloadForm()) {
                return;
            }

            if (siteIds.length > 50) {
                this.downloadProgressDialog.show('map',
                    'Unable to map sites. The query contains too many sites to be mapped. Downloads are still available');
            } else {
                window._gaq.push([
                    '_trackEvent',
                    'Portal Map',
                    'MapCount',
                    decodeURIComponent(queryString)
                ]);


                this.downloadProgressDialog.show('map');
                PORTAL.queryServices.fetchQueryCounts(STATION_RESULTS, queryParamArray, PORTAL.MODELS.providers.getIds())
                    .done((counts) => {
                        var fileFormat = 'xml';
                        this.downloadProgressDialog.updateProgress(counts, STATION_RESULTS, fileFormat, showMap);
                    })
                    .fail((message) => {
                        this.downloadProgressDialog.cancelProgress(message);
                    });
            }
        });
    }
}
