/*
 * Initializes the windows which show the various API calls
 * @param {Object} options
 *      @prop {Jquery element} $container - The container containing the show button and the query windows.
 *      @prop {Function} getQueryParamArray - Returns the current query parameter array
    *       @returns {Array of Objects with name and value properties}
 */
export default class ShowAPIView {
    constructor({$container, getQueryParamArray}) {
        this.$container = $container;
        this.getQueryParamArray = getQueryParamArray;
    }

    initialize() {
        var $apiQueryDiv = this.$container.find('#api-queries-div');
        var $sitesText = this.$container.find('#sites-query-div textarea');
        var $resultsText = this.$container.find('#results-query-div textarea');
        var $activitiesText = this.$container.find('#activities-query-div textarea');
        var $activitymetricsText = this.$container.find('#activitymetrics-query-div textarea');
        var $resultdetectionText = this.$container.find('#resultdetection-query-div textarea');
        var $wfsText = this.$container.find('#getfeature-query-div textarea');

        this.$container.find('#show-queries-button').click(() => {
            var queryParamArray = this.getQueryParamArray();
            var queryWithoutDataProfileArray = queryParamArray.filter((param) => {
                return param.name !== 'dataProfile';
            });
            var queryString = PORTAL.UTILS.getQueryString(queryParamArray);
            var queryStringWithoutDataProfile = PORTAL.UTILS.getQueryString(queryWithoutDataProfileArray);

            $apiQueryDiv.show();
            $sitesText.html(PORTAL.queryServices.getFormUrl('Station', queryStringWithoutDataProfile));
            $resultsText.html(PORTAL.queryServices.getFormUrl('Result', queryString));
            $activitiesText.html(PORTAL.queryServices.getFormUrl('Activity', queryStringWithoutDataProfile));
            $activitymetricsText.html(PORTAL.queryServices.getFormUrl('ActivityMetric', queryStringWithoutDataProfile));
            $resultdetectionText.html(PORTAL.queryServices.getFormUrl('ResultDetectionQuantitationLimit', queryStringWithoutDataProfile));
            $wfsText.html(L.WQPSitesLayer.getWfsGetFeatureUrl(queryWithoutDataProfileArray));
        });
    }
}
