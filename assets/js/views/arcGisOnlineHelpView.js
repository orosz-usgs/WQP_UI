import dialogBodyTemplate from '../hbTemplates/arcGisHelp.hbs';


const HEADER = 'Using WQP Maps with ArcGIS online';


/*
 * @param {Jquery element} $button - Arc GIS help button
 * @param {Jquery element} $dialog - Arc GIS help dialog
 * @param {Jquery element} $siteMapViewContainer - The map view container element
 * @param {Function} getQueryParamArray -
 *      @returns {Array of Objects with name and value properties} - The form's current query parameters.
 */
export default class ArcGisOnlineHelpView {
    constructor({$button, $dialog, $siteMapViewContainer, getQueryParamArray}) {
        this.$button = $button;
        this.$dialog = $dialog;
        this.$siteMapViewContainer = $siteMapViewContainer;
        this.getQueryParamArray = getQueryParamArray;
    }

    /*
     * Shows the Arc GIS help dialog with the content reflecting the parameters.
     * @param {Array of Objects with name and value properties} - Represents the query parameters that
     *      will be in the dialog
     * @param {String} selectedSld - The SLD string that will be used to in the dialog
     */
    showDialog(queryParams, selectedSld) {

        var hbContext = {
            searchParams: L.WQPSitesLayer.getSearchParams(queryParams),
            style: selectedSld
        };

        this.$dialog.find('.modal-body').html(dialogBodyTemplate(hbContext));
        this.$dialog.modal('show');
    }

    /*
     * Initialize the Arc GIS online view, initializing content and setting up event handlers as needed.
     */
    initialize() {
        var $sldSelect = this.$siteMapViewContainer.find('#sld-select-input');

        this.$dialog.find('.modal-header h4').html(HEADER);

        this.$button.click(() => {
            var queryParamArray = this.getQueryParamArray();
            var selectedSld = $sldSelect.val();
            this.showDialog(queryParamArray, selectedSld);
        });
    }
}
