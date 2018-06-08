import filter from 'lodash/collection/filter';
import find from 'lodash/collection/find';
import flatten from 'lodash/array/flatten';
import has from 'lodash/object/has';
import map from 'lodash/collection/map';
import pluck from 'lodash/collection/pluck';
import log from 'loglevel';


var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

/*
 * @param {Object} options
 *      @prop {String} codes - String used in the url to retrieve the model's data.
 * @returns {PORTAL.MODELS.cachedCodes}
 *      @prop {Function} fetch
 *      @prop {Function} getAll
 *     @prop {Function} getLookups
 */
PORTAL.MODELS.cachedCodes = function(options) {
    var self = {};

    var cachedData = [];
    var HEADERS = PORTAL.UTILS.getHeaders();

    /*
     * @return {$.Promise}.
     *      @resolve {Array of Objects} - Each object has String properties: id, desc, and providers.
     *      @reject {String} - the error message.
     */
    self.fetch = function() {
        var fetchDeferred = $.Deferred();
        var URL = Config.CODES_ENDPOINT + '/' + options.codes;
        $.ajax({
            url: URL,
            type: 'GET',
            headers: HEADERS,
            data: {
                mimeType: 'json'
            },
            success: function (data) {
                cachedData = map(data.codes, function (code) {
                    return {
                        id: code.value,
                        desc: has(code, 'desc') && code.desc ? code.desc : code.value, // defaults to value
                        providers: code.providers
                    };
                });

                fetchDeferred.resolve(cachedData);
            },

            error: function(jqXHR, textStatus, error) {
                log.error('Can\'t  get ' + options.codes + ', Server error: ' + error);
                fetchDeferred.reject(error);
            }
        });
        return fetchDeferred.promise();
    };

    /*
     * @returns {Array of Objects} - Each object has String properties: id, desc, and providers. This is the
     * same object that is returned with the last successfully fetch.
     */
    self.getAll = function() {
        return cachedData;
    };

    /*
     * @returns {Object} - The object in the model with the matching id property. Object contains id, desc, and providers
     *      properties. Return undefined if no object exists
     */
    self.getLookup = function (id) {
        return find(cachedData, function (lookup) {
            return lookup.id === id;
        });
    };

    return self;
};
/*
 *
 * @param {Object} options -
 *          @prop {String} codes - Used in the ajax url to retrieve the data
 *          @prop {String} keyParameter - the parameter name to use to retrieve the appropriate data subset
 *          @prop {Function} parseKey - function takes a lookup item and returns a string for the key it represents.
 * @returns {PORTAL.MODELS.codesWithKeys}
 *          @prop {Function} fetch
 *          @prop {Function} getAll
 *          @prop {Function} getAllKeys
 *          @prop {Function} getDataForKey
 *
 */
PORTAL.MODELS.codesWithKeys = function(options) {
    var self = {};

    var cachedData = [];
    var HEADERS = PORTAL.UTILS.getHeaders();
    /* Each object where each value is an array of objects with properties id, desc, and providers */

    /*
     * @param {Array of String} keys - the set of keys to be used when retrieving the lookup codes
     * @returns {Jquery.Promise}
     *      @resolve {Array of Objects} - each object is a lookup with id, desc, and providers properties.
     *      @reject {String} descriptive error string
     */
    self.fetch = function(keys) {
        var fetchDeferred = $.Deferred();
        var URL = Config.CODES_ENDPOINT + '/' + options.codes;

        $.ajax({
            url: URL + '?' + options.keyParameter + '=' + keys.join(';'),
            type: 'GET',
            data: {
                mimeType: 'json'
            },
            headers: HEADERS,
            success: function (data) {
                cachedData = map(keys, function (key) {
                    var filtered = filter(data.codes, function (lookup) {
                        return options.parseKey(lookup.value) === key;
                    });
                    return {
                        key: key,
                        data: map(filtered, function (lookup) {
                            return {
                                id: lookup.value,
                                desc: has(lookup, 'desc') && lookup.desc ? lookup.desc : lookup.value, // defaults to value
                                providers: lookup.providers
                            };
                        })
                    };
                });
                fetchDeferred.resolve(self.getAll());
            },
            error: function(jqXHR, textStatus, error) {
                log.error('Can\'t get ' + options.codes + ', Server error: ' + error);
                fetchDeferred.reject(error);
            }
        });

        return fetchDeferred.promise();
    };

    /*
     * @return {Array of Object} - Object has id, desc, and providers string properties
     */
    self.getAll = function () {
        var all = pluck(cachedData, 'data');
        return flatten(all);
    };

    /*
     * @return {Array of String}
     */
    self.getAllKeys = function () {
        return pluck(cachedData, 'key');
    };

    /*
     * @return {Array of Objects} - Each object is a lookup with id, desc, and providers properties. Return undefined if that key
     * is not in the model
     */
    self.getDataForKey = function(key) {
        var isMatch = function(object) {
            return object.key === key;
        };
        var lookup = find(cachedData, isMatch);
        if (lookup) {
            return lookup.data;
        } else {
            return undefined;
        }
    };

    return self;
};
