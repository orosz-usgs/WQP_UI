import dialogBodyTemplate from '../hbTemplates/arcGisHelp.hbs';


var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

(function() {
    /*
     * @param {Jquery element} $button - Arc GIS help button
     * @param {Jquery element} $dialog - Arc GIS help dialog
     * @param {Jquery element} $siteMapViewContainer - The map view container element
     * @param {Function} getQueryParamArray -
     *      @returns {Array of Objects with name and value properties} - The form's current query parameters.
     */
    PORTAL.VIEWS.arcGisOnlineHelpView = function (options) {

        var self = {};

        var HEADER = 'Using WQP Maps with ArcGIS online';

        /*
         * Shows the Arc GIS help dialog with the content reflecting the parameters.
         * @param {Array of Objects with name and value properties} - Represents the query parameters that
         *      will be in the dialog
         * @param {String} selectedSld - The SLD string that will be used to in the dialog
         */
        var showDialog = function (queryParams, selectedSld) {

            var hbContext = {
                searchParams: L.WQPSitesLayer.getSearchParams(queryParams),
                style: selectedSld
            };

            options.$dialog.find('.modal-body').html(dialogBodyTemplate(hbContext));
            options.$dialog.modal('show');
        };

        /*
         * Initialize the Arc GIS online view, initializing content and setting up event handlers as needed.
         */
        self.initialize = function () {
            var $sldSelect = options.$siteMapViewContainer.find('#sld-select-input');

            options.$dialog.find('.modal-header h4').html(HEADER);

            options.$button.click(function () {
                var queryParamArray = options.getQueryParamArray();
                var selectedSld = $sldSelect.val();
                showDialog(queryParamArray, selectedSld);
            });
        };

        return self;
    };
})();
