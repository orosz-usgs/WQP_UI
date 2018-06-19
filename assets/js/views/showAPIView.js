import queryService from '../queryService';
import { getQueryString, checkForUseOfDataProfileArray, separateCurlDataFromParams, buildCurlString } from '../utils';

/*
 * Initializes the windows which show the various API calls
 * @param {Object} options
 *      @prop {Jquery element} $container - The container containing the show button and the query windows.
 *      @prop {Function} getQueryParamArray - Returns the current query parameter array
 *      @prop {Function} getResultType - Returns the result type value the user selected in the form
 *      @returns {Array of Objects with name and value properties}
 */
export default class ShowAPIView {
    constructor({$container, getQueryParamArray, getResultType}) { // added parameter for WQP-1195
        this.$container = $container;
        this.getQueryParamArray = getQueryParamArray;
        this.getRequestType = getResultType; // added for WQP-1195
    }

    initialize() {
        let $apiQueryDiv = this.$container.find('#api-queries-div');
        let $apiQueryTitle = this.$container.find('#query-div b');
        let $apiQueryText = this.$container.find('#query-div textarea'); // added for WQP-1195
        let $cUrlText = this.$container.find('#curl-query-div textarea'); // added for WQP-1195
        let $wfsText = this.$container.find('#getfeature-query-div textarea'); // added for WQP-1195

        this.$container.find('#show-queries-button').click(() => {
            let resultType = this.getRequestType(); // added for WQP-1195

            let queryParamArray = this.getQueryParamArray();
            let queryWithoutDataProfileArray = queryParamArray.filter((param) => {
               return param.name !== 'dataProfile';
            });

            let queryString = getQueryString(queryParamArray);
            let queryStringWithoutDataProfile = getQueryString(queryWithoutDataProfileArray);
            let apiQueryString =  ''; // added for WQP-1195

            let isDataProfileUsed = checkForUseOfDataProfileArray()[resultType]; // added for WQP-1195
            if (isDataProfileUsed) {
                apiQueryString = queryService.getFormUrl(resultType, queryString);
            } else {
                apiQueryString = queryService.getFormUrl(resultType, queryStringWithoutDataProfile);
            }

            let allParams = separateCurlDataFromParams(queryParamArray);
            let curlString = buildCurlString(resultType, allParams); // added for WQP-1195

            $apiQueryDiv.show();
            $apiQueryTitle.html(resultType.replace(/([A-Z])/g, ' $1')); // added for WQP-1195
            $apiQueryText.html(apiQueryString); // modified for WQP-1195
            $cUrlText.html(curlString);

            $wfsText.html(L.WQPSitesLayer.getWfsGetFeatureUrl(queryWithoutDataProfileArray));
        });
    }

// start -  added for WQP-1195
    updateWebCallDisplay(resultType) {
    }
// end - added for WQP-1195
}
