var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};
/*
 *
 * @param {Object} spec
 *      spec properties:
 *          codes - String used in the url to retrieve the model's data.
 * @returns {PORTAL.MODELS.codes.that}
 *      properties:
 *          getData - function that returns a promise. If resolved, returns the array of codes data. 
 *              If rejected, returns the error message.
 */
PORTAL.MODELS.cachedCodes = function(spec) {
    /* spec object has property codes - String */
    var that = {};

    var cachedData = [];

    var ajaxCalled = false;
    var ajaxCompleteDeferred = $.Deferred();

    /*
     * 
     * @return {$.Deferred.promise}. A resolved promise returns {Array of Object} where each object
     * has String properties: id, desc, and providers. A rejected promise returns {String} with the error message.
     */
    that.processData = function() {
        // Make an ajax call to get the data if it has not been previously retrieved.
        if (!ajaxCalled) {
            ajaxCalled = true;
			if (ajaxCompleteDeferred.state() === 'rejected') {
				// Start a new deferred
				ajaxCompleteDeferred = $.Deferred();
			}
            $.ajax({
                    url: Config.CODES_ENDPOINT + '/' + spec.codes,
                    type: 'GET',
                    data : {
                        mimeType : 'json'
                    },
                    success : function(data, textStatus, jqXHR) {
						$.each(data.codes, function(index, code) {
							cachedData.push({
								id: code.value,
								desc : (code.hasOwnProperty('desc') && (code.desc)  ? code.desc : code.value),
								providers : code.providers
							});
						});
						ajaxCompleteDeferred.resolve(cachedData);
                    },

                    error : function(jqXHR, textStatus, error) {
                        alert('Can\'t  get ' + spec.codes + ', Server error: ' + error);
                        ajaxCompleteDeferred.reject(error);
                        ajaxCalled = false;
                    }
                });
        }
        return ajaxCompleteDeferred.promise();
    };

    return that;
};
/*
 *
 * @param {Object} spec -
 *          @prop {String} codes - Used in the ajax url to retrieve the data
 *          @prop {String} keyParameter - the parameter name to use to retrieve the appropriate data subset
 *          @prop {Function} parseKey - Takes the id from a data Object and produce it's key
 * @returns {PORTAL.MODELS.codesWithKeys.that}
 *      properties:
 *          @prop {Function} processData - Returns {$.Deferred.promise}. When resolved will contain the data requested.
 *          
 *          function takes a processFnc parameter and keys (Array of strings_). The processFnc function will
 *                        take an an array of objects parameter. Each object will have
 *                        an id, desc, and providers property.
 */
PORTAL.MODELS.cachedCodesWithKeys = function(spec) {
    var that = {};

    var cachedData = {}; /* Will be an object where each value is an array of objects with properties id, desc, and providers */

    var getData = function(keys /* Array of Strings */) {
        var results = {};
        var i = 0;

        for (i = 0; i < keys.length; i++) {
            results[keys[i]] = cachedData[keys[i]];
        }

        return results;
    };

    /*
     * @param {Array of String} keys - the specific keys' cached data that will be returned in the resolve promise
     * @return {$.Deferred.promise -  A resolved promise returns {Array of Object} where each object
     * has String properties: id, desc, and providers. A rejected promise returns {String} with the error message.
     */
    that.processData = function(keys) {

        var keysToGet = [];
        var i;
        var ajaxData = {};
        var deferred = $.Deferred();

        // Determine if we already have the requested data cached
        for (i = 0; i < keys.length; i++){
            if (!(keys[i] in cachedData)) {
                keysToGet.push(keys[i]);
            }
        }

        if (keysToGet.length === 0) {
            // Can get all keys from the cache
            deferred.resolve(getData(keys));
        }
        else {
            // We have to retrieve at least some of the keys //
            ajaxData[spec.keyParameter] = keysToGet.join(';');
            ajaxData.mimeType = 'json';
            $.ajax({
                url : Config.CODES_ENDPOINT + '/' + spec.codes,
                type: 'GET',
                data : ajaxData,
                success : function(data, textStatus, jqXHR) {
                    var k;
                    //Initialize cache for each key
                    for (k = 0; k < keysToGet.length; k++) {
                        cachedData[keysToGet[k]] = [];
                    }
                    $.each(data.codes, function(index, code) {
						var thisData = {
								id : code.value,
								desc : (code.hasOwnProperty('desc') && (code.desc) ? code.desc : code.value),
								providers : code.providers
						};
						var key = spec.parseKey(thisData.id);
						cachedData[key].push(thisData);
                    });
                    deferred.resolve(getData(keys));
                },
                error : function(jqXHR, textStatus, error) {
                    alert("Can't get " + spec.codes + ', Server error: ' + error);
                    deferred.reject(error);
                }
            });
        }
        return deferred.promise();
    };

    return that;
};

// Objects that represent the available values for portal selections.
PORTAL.MODELS.countryCodes = PORTAL.MODELS.cachedCodes({codes : 'countrycode'});
PORTAL.MODELS.stateCodes = PORTAL.MODELS.cachedCodesWithKeys({
    codes : 'statecode',
    keyParameter : 'countrycode',
    parseKey : function(id) {
        return id.split(':')[0];
    }
});
PORTAL.MODELS.countyCodes = PORTAL.MODELS.cachedCodesWithKeys({
    codes: 'countycode',
    keyParameter : 'statecode',
    parseKey: function(id) {
        var idArray = id.split(':');
        return idArray[0] + ':' + idArray[1];
    }
});

PORTAL.MODELS.siteType = PORTAL.MODELS.cachedCodes({codes : 'sitetype'});
PORTAL.MODELS.organization = PORTAL.MODELS.cachedCodes({codes : 'organization'});
PORTAL.MODELS.sampleMedia = PORTAL.MODELS.cachedCodes({codes : 'samplemedia'});
PORTAL.MODELS.characteristicType = PORTAL.MODELS.cachedCodes({codes : 'characteristictype'});
PORTAL.MODELS.assemblage = PORTAL.MODELS.cachedCodes({codes : 'assemblage'});
