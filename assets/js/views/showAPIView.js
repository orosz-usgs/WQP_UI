import queryService from '../queryService';
import { getQueryString } from '../utils';
import {getUrl} from "../nldiModel";


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
        let $apiQueryDiv = this.$container.find('#api-queries-div');
        let $apiQueryTitle = this.$container.find('#query-div b');
        let $apiQueryText = this.$container.find('#query-div textarea'); // added for WQP-1195
        let $cUrlText = this.$container.find('#curl-query-div textarea'); // added for WQP-1195
        let $wfsText = this.$container.find('#getfeature-query-div textarea'); // added for WQP-1195

/* start -- original code
        var $sitesText = this.$container.find('#sites-query-div textarea');
        var $resultsText = this.$container.find('#results-query-div textarea');
        var $activitiesText = this.$container.find('#activities-query-div textarea');
        var $activitymetricsText = this.$container.find('#activitymetrics-query-div textarea');
        var $resultdetectionText = this.$container.find('#resultdetection-query-div textarea');
end -- original code */

        this.$container.find('#show-queries-button').click(() => {
            let resultType = this.getRequestType(); // added for WQP-1195

            let queryParamArray = this.getQueryParamArray();
            let queryWithoutDataProfileArray = queryParamArray.filter((param) => {
               return param.name !== 'dataProfile';
            });

            let queryString = getQueryString(queryParamArray);
            let queryStringWithoutDataProfile = getQueryString(queryWithoutDataProfileArray);
            let apiQueryString =  ''; // added for WQP-1195

            let isDataProfileUsed = this.checkForUseOfDataProfileArray()[resultType]; // added for WQP-1195
            if (isDataProfileUsed) {
                apiQueryString = queryService.getFormUrl(resultType, queryString);
            } else {
                apiQueryString = queryService.getFormUrl(resultType, queryStringWithoutDataProfile);
            }

            let curlString = this.buildCurlString(resultType, queryParamArray); // added for WQP-1195

            $apiQueryDiv.show();
            $apiQueryTitle.html(resultType.replace(/([A-Z])/g, ' $1')); // added for WQP-1195
            $apiQueryText.html(apiQueryString); // modified for WQP-1195
            $cUrlText.html(curlString);

// following two lines added for testing
let $goalcUrlText = this.$container.find('#temporary-curl-query-div textarea')
$goalcUrlText.html('curl -X POST --header \'Content-Type: application/json\' --header \'Accept: application/zip\' -d \'{"statecode":["US:02"],"countycode":["US:02:016"]}\' \'https://www.waterqualitydata.us/data/Station/search?mimeType=csv&zip=yes\'')

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
        // var $apiQueriesDiv = this.$container.find('#api-queries-div');
        // $apiQueriesDiv.hide(750);

/* start - disabled
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
            console.debug('failed to match any resultType, cannot create URL')
        }
end - disabled */
    }

    checkForUseOfDataProfileArray() {
        let dataProfileUsed = {
            'Station' : false,
            'Project' : false,
            'ProjectMonitoringLocationWeighting' : false,
            'Result' : true,
            'Activity' : false,
            'ActivityMetric' : false,
            'ResultDetectionQuantitationLimit' : false,
            'default' : false
        };

        return dataProfileUsed;
    }

     buildCurlString(resultType, queryParamArray) {
        let countryCodes = [];
        let stateCodes = [];
        let countyCodes = [];

        let curlParamsArray = [
                {name: 'mimeType', value: ''},
                {name: 'zipType', value: ''},
                {name: 'sortType', value: ''}
            ];


        let countryCodesString = '';


        for(let key in queryParamArray) {
            if(queryParamArray.hasOwnProperty(key)) {
                let currentObject = queryParamArray[key];

                if (currentObject['name'] === 'countrycode') {
                    countryCodes = currentObject['value'];
                    countryCodesString = '"countrycode":' + JSON.stringify(countryCodes);

                }
                if (currentObject['name'] === 'statecode') {
                    stateCodes = currentObject['value'];
                }
                if (currentObject['name'] === 'countycode') {
                    countryCodes = currentObject['value'];

                }
                if (currentObject['name'] === 'mimeType') {
                    curlParamsArray[0].value = currentObject['value'];
                }
                if (currentObject['name'] === 'zip') {
                    curlParamsArray[1].value = currentObject['value'];
                }
                if (currentObject['name'] === 'sorted') {
                    console.log('!!!this is value ' + currentObject['value'])
                    curlParamsArray[2].value = currentObject['value'];
                }
            }
        }
console.log('this is the countryValue now ' + countryCodes)
console.log('this is the statecode now ' + stateCodes)
console.log('this is the countycodes now ' + countyCodes)
console.log('this is the array params ' + JSON.stringify(curlParamsArray))



console.log('in buildCurlString, queryParamArray ' + JSON.stringify(queryParamArray))
        let contentType = 'application/json';

        let urlBase = Config.QUERY_URLS[resultType];

        let params = $.param(curlParamsArray);

        let curlString = `curl -X POST --header 'Content-Type: ${contentType}' --header 'Accept: ' -d'{${countryCodesString}}''${urlBase}?${params}'`;

        return curlString;
    }
// end - added for WQP-1195
}
