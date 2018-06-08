var PORTAL = window.PORTAL = window.PORTAL || {};

PORTAL.queryServices = (function() {
    var self = {};

    /*
     * @param {String} resultType - 'Station' or 'Result'
     * @param {Array of Objects with name, value and multiple properties representing query parameters} queryParamArray
     * @param {Array of Strings} providers - The application's providers.
     * @return {Jquery.Promise}
     *      @resolve {Object} - If the counts are successfully fetched this object will contain a 'total' property and
     *          properties for each provider. This property values will be an object with sites and results properties which
     *          will contain the counts for that provider (or total)
     *      @reject {String} - If the fetch fails, returns an error message.
     */
    self.fetchQueryCounts = function(resultType, queryParamArray, providers) {
        var deferred = $.Deferred();

        var queryParamJson = PORTAL.UTILS.getQueryParamJson(queryParamArray);
        var countQueryJson = _.omit(queryParamJson, ['mimeType', 'zip', 'sorted']);

        var formatCount = function(countData, key) {
            var countString = _.has(countData, key) ? countData[key] : '0';
            var result = numeral(countString).format('0,0');
            return result === '0' ? '0' : result;
        };

        $.ajax({
            url: Config.QUERY_URLS[resultType] + '/count?mimeType=json',
            method: 'POST',
            headers: PORTAL.UTILS.getHeaders(),
            contentType: 'application/json',
            data: JSON.stringify(countQueryJson),
            success: function(data) {
                var result = {
                    total: {
                        sites: formatCount(data, 'Total-Site-Count'),
                        projects: formatCount(data, 'Total-Project-Count'),
                        projectmonitoringlocationweightings: formatCount(data, 'Total-ProjectMonitoringLocationWeighting-Count'),
                        results: formatCount(data, 'Total-Result-Count'),
                        activities: formatCount(data, 'Total-Activity-Count'),
                        activitymetrics: formatCount(data, 'Total-ActivityMetric-Count'),
                        resultdetections: formatCount(data, 'Total-ResultDetectionQuantitationLimit-Count')
                    }
                };
                _.each(providers, function(provider) {
                    result[provider] = {
                        sites: formatCount(data, provider + '-Site-Count'),
                        projects: formatCount(data, provider + '-Project-Count'),
                        projectmonitoringlocationweightings: formatCount(data, provider + '-ProjectMonitoringLocationWeighting-Count'),
                        results: formatCount(data, provider + '-Result-Count'),
                        activities: formatCount(data, provider + '-Activity-Count'),
                        activitymetrics: formatCount(data, provider + '-ActivityMetric-Count'),
                        resultdetections: formatCount(data, provider + '-ResultDetectionQuantitationLimit-Count')
                    };
                });
                log.debug('Successfully got counts');
                deferred.resolve(result);
            },
            error: function(jqXHR, textStatus) {
                log.error('Unable to contact the WQP services: ' + textStatus);
                deferred.reject('Unable to contact the WQP services: ' + textStatus);
            }
        });

        return deferred.promise();
    };

    /*
     * @param {String} resultType
     * @param {String} queryParams - a query string
     * @returns {String} - the url and query params to download data
     */
    self.getFormUrl = function(resultType, queryParams) {
        var result = Config.DOWNLOAD_URLS[resultType];
        if (queryParams) {
            result = result + '?' + queryParams;
        }
        return result;
    };

    return self;

}());



