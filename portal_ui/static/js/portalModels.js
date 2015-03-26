var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};
/*
 *
 * @param {Object} spec
 *      spec properties:
 *          codes - String used in the url to retrieve the model's data.
 * @returns {PORTAL.MODELS.codes.that}
 *      properties:
 *          processData - function takes a processFnc parameter. This function will
 *                        take an an array of objects parameter. Each object will have
 *                        an id, desc, and providers property.
 */
PORTAL.MODELS.codes = function(spec) {
    /* spec object has property codes - String */
    var that = {};

    var cachedData = [];

    var ajaxCalled = false;
    var ajaxCompleteDeferred = $.Deferred();

    that.processData = function(processFnc /* Function with Array of objects argument. objects have id, desc, and providers properties */) {
        // Make an ajax call to get the data if it has not been previously retrieved.
        if (ajaxCalled) {
            ajaxCompleteDeferred.done(processFnc);
        }
        else {
            ajaxCalled = true;
            $.ajax({
                    url: Config.CODES_ENDPOINT + spec.codes,
                    type: 'GET',
                    data : {
                        mimeType : 'xml'
                    },
                    success : function(data, textStatus, jqXHR) {
                        $(data).find('Code').each(function() {
                            cachedData.push({
                                id: $(this).attr('value'),
                                desc : $(this).attr('desc') || $(this).attr('value'),
                                providers : $(this).attr('providers')
                            });
                        });
                        processFnc(cachedData);
                        ajaxCompleteDeferred.resolve(cachedData);
                    },

                    error : function(jqXHR, textStatus, error) {
                        alert('Can\'t  get ' + spec.codes + ', Server error: ' + error);
                        ajaxCalled = false;
                    }
                });
        }

    };

    return that;
};
/*
 *
 * @param {Object} spec -
 *      spec properties
 *          codes - String used in the ajax url to retrieve the data
 *          keyParameter - String - the parameter name to use to retrieve the appropriate data subset
 *          parseKey - Function which will take the id from a data Object and produce it's key
 * @returns {PORTAL.MODELS.codesWithKeys.that}
 *      properties:
 *          processData - function takes a processFnc parameter and keys (Array of strings_). The orocessFnc function will
 *                        take an an array of objects parameter. Each object will have
 *                        an id, desc, and providers property.
 */
PORTAL.MODELS.codesWithKeys = function(spec) {
/* spec object has property
 * codes - String,
 * keyParameter - String *,
 * parseKey - function which will take the id from the raw data and produce its key
 */
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

    that.processData = function(processFnc /* Function with object argument, where keys are the code keys and the values are an array of object with properties id, desc, and providers.  */,
        keys /* Array of strings */) {

        var keysToGet = [];
        var i;
        var ajaxData = {};

        // Determine if we already have the requested data cached
        for (i = 0; i < keys.length; i++){
            if (!(keys[i] in cachedData)) {
                keysToGet.push(keys[i]);
            }
        }

        if (keysToGet.length === 0) {
            // Can get all keys from the cache
            processFnc(getData(keys));
        }
        else {
            // We have to retrieve at least some of the keys //
            ajaxData[spec.keyParameter] = keysToGet.join(';');
            ajaxData.mimeType = 'xml';
            $.ajax({
                url : Config.CODES_ENDPOINT + spec.codes,
                type: 'GET',
                data : ajaxData,
                success : function(data, textStatus, jqXHR) {
                    var k;

                    for (k = 0; k < keysToGet.length; k++) {
                        cachedData[keysToGet[k]] = [];
                    }
                    $(data).find('Code').each(function() {
                        var thisData = {
                            id: $(this).attr('value'),
                            desc : $(this).attr('desc') || $(this).attr('value'),
                            providers : $(this).attr('providers')
                        };
                        var key = spec.parseKey(thisData.id);
                        cachedData[key].push(thisData);
                    });

                    processFnc(getData(keys));
                },
                error : function(jqXHR, textStatus, error) {
                    alert("Can't get " + spec.codes + ', Server error: ' + error);
                }
            });
        }
    };

    return that;
};

// Objects that represent the available values for portal selections.
PORTAL.MODELS.countryCodes = PORTAL.MODELS.codes({codes : 'countrycode'});
PORTAL.MODELS.stateCodes = PORTAL.MODELS.codesWithKeys({
    codes : 'statecode',
    keyParameter : 'countrycode',
    parseKey : function(id) {
        return id.split(':')[0];
    }
});
PORTAL.MODELS.countyCodes = PORTAL.MODELS.codesWithKeys({
    codes: 'countycode',
    keyParameter : 'statecode',
    parseKey: function(id) {
        var idArray = id.split(':');
        return idArray[0] + ':' + idArray[1];
    }
});

PORTAL.MODELS.siteType = PORTAL.MODELS.codes({codes : 'siteType'});
PORTAL.MODELS.organization = PORTAL.MODELS.codes({codes : 'organization'});
PORTAL.MODELS.sampleMedia = PORTAL.MODELS.codes({codes : 'sampleMedia'});
PORTAL.MODELS.characteristicType = PORTAL.MODELS.codes({codes : 'characteristicType'});
PORTAL.MODELS.characteristicName = PORTAL.MODELS.codes({codes : 'characteristicName'});

