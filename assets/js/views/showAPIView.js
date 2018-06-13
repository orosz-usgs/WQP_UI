import queryService from '../queryService';
import { getQueryString } from '../utils';


/*
 * Initializes the windows which show the various API calls
 * @param {Object} options
 *      @prop {Jquery element} $container - The container containing the show button and the query windows.
 *      @prop {Function} getQueryParamArray - Returns the current query parameter array
    *       @returns {Array of Objects with name and value properties}
 */
export default class ShowAPIView {
    constructor({$container, getQueryParamArray, getResultType}) { // added parameter for WQP-1195
        this.$container = $container;
        this.getQueryParamArray = getQueryParamArray;
        this.getRequestType = getResultType; // added for WQP-1195
    }

    initialize() {
        var $apiQueryTitle = this.$container.find('#query-div b');
        var $apiQueryText = this.$container.find('#query-div textarea'); // added for WQP-1195
        var $wfsText = this.$container.find('#getfeature-query-div textarea'); // added for WQP-1195


        var $apiQueryDiv = this.$container.find('#api-queries-div');

/* start -- original code
        var $sitesText = this.$container.find('#sites-query-div textarea');
        var $resultsText = this.$container.find('#results-query-div textarea');
        var $activitiesText = this.$container.find('#activities-query-div textarea');
        var $activitymetricsText = this.$container.find('#activitymetrics-query-div textarea');
        var $resultdetectionText = this.$container.find('#resultdetection-query-div textarea');
end -- original code */

        this.$container.find('#show-queries-button').click(() => {
            var resultType = this.getRequestType(); // added for WQP-1195

            var queryParamArray = this.getQueryParamArray();
            var queryWithoutDataProfileArray = queryParamArray.filter((param) => {
                return param.name !== 'dataProfile';
            });
            var queryString = getQueryString(queryParamArray);
            var queryStringWithoutDataProfile = getQueryString(queryWithoutDataProfileArray);

            $apiQueryDiv.show();
            $apiQueryTitle.html(resultType); // added for WQP-1195

// following line needs to change to accommodate the correct query string
            $apiQueryText.html(queryService.getFormUrl(resultType, queryStringWithoutDataProfile));

/* start - original code
            $sitesText.html(queryService.getFormUrl('Station', queryStringWithoutDataProfile));
            $resultsText.html(queryService.getFormUrl('Result', queryString));
            $activitiesText.html(queryService.getFormUrl('Activity', queryStringWithoutDataProfile));
            $activitymetricsText.html(queryService.getFormUrl('ActivityMetric', queryStringWithoutDataProfile));
            $resultdetectionText.html(queryService.getFormUrl('ResultDetectionQuantitationLimit', queryStringWithoutDataProfile));
end - original code */

            $wfsText.html(L.WQPSitesLayer.getWfsGetFeatureUrl(queryWithoutDataProfileArray));
        });
    }
// start -  added for WQP-1195
    updateWebCallDisplay(resultType) {
        var $apiQueryTitle = this.$container.find('#query-div b');
        var $apiQueryText = this.$container.find('#query-div textarea');

        $apiQueryTitle.html(resultType.replace(/([A-Z])/g, ' $1'));

        var queryParamArray = this.getQueryParamArray();

        var queryParamArray = this.getQueryParamArray();
        var queryWithoutDataProfileArray = queryParamArray.filter((param) => {
            return param.name !== 'dataProfile';
        });
        var queryString = getQueryString(queryParamArray);
        var queryStringWithoutDataProfile = getQueryString(queryWithoutDataProfileArray);

        if (resultType != 'Result' ) {
            $apiQueryText.html(queryService.getFormUrl(resultType, queryStringWithoutDataProfile));
        } else if (resultType == 'Result') {
            $apiQueryText.html(queryService.getFormUrl(resultType, queryString));
        } else {
            console.debug('failed to match and resultType, cannot create URL')
        }
    }



// end - added for WQP-1195
}
