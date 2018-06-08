import filter from 'lodash/collection/filter';
import find from 'lodash/collection/find';
import flatten from 'lodash/array/flatten';
import has from 'lodash/object/has';
import map from 'lodash/collection/map';
import pluck from 'lodash/collection/pluck';
import log from 'loglevel';


/*
 * @param {Object} options
 *      @prop {String} codes - String used in the url to retrieve the model's data.
 * @returns {CachedCodes}
 *      @prop {Function} fetch
 *      @prop {Function} getAll
 *     @prop {Function} getLookups
 */
export class CachedCodes {
    constructor({codes}) {
        this.codes = codes;
        this.cachedData = [];
    }

    /*
     * @return {$.Promise}.
     *      @resolve {Array of Objects} - Each object has String properties: id, desc, and providers.
     *      @reject {String} - the error message.
     */
    fetch() {
        var fetchDeferred = $.Deferred();
        var URL = Config.CODES_ENDPOINT + '/' + this.codes;
        $.ajax({
            url: URL,
            type: 'GET',
            data: {
                mimeType: 'json'
            },
            success: (data) => {
                this.cachedData = map(data.codes, (code) => {
                    return {
                        id: code.value,
                        desc: has(code, 'desc') && code.desc ? code.desc : code.value, // defaults to value
                        providers: code.providers
                    };
                });

                fetchDeferred.resolve(this.cachedData);
            },

            error: (jqXHR, textStatus, error) => {
                log.error('Can\'t  get ' + this.codes + ', Server error: ' + error);
                fetchDeferred.reject(error);
            }
        });
        return fetchDeferred.promise();
    }

    /*
     * @returns {Array of Objects} - Each object has String properties: id, desc, and providers. This is the
     * same object that is returned with the last successfully fetch.
     */
    getAll() {
        return this.cachedData;
    }

    /*
     * @returns {Object} - The object in the model with the matching id property. Object contains id, desc, and providers
     *      properties. Return undefined if no object exists
     */
    getLookup(id) {
        return find(this.cachedData, function (lookup) {
            return lookup.id === id;
        });
    }
}

/*
 *
 * @param {Object} options -
 *          @prop {String} codes - Used in the ajax url to retrieve the data
 *          @prop {String} keyParameter - the parameter name to use to retrieve the appropriate data subset
 *          @prop {Function} parseKey - function takes a lookup item and returns a string for the key it represents.
 * @returns {CodesWithKeys}
 *          @prop {Function} fetch
 *          @prop {Function} getAll
 *          @prop {Function} getAllKeys
 *          @prop {Function} getDataForKey
 *
 */
export class CodesWithKeys {
    constructor({codes, keyParameter, parseKey}) {
        this.codes = codes;
        this.keyParameter = keyParameter;
        this.parseKey = parseKey;
        this.cachedData = [];
    }

    /* Each object where each value is an array of objects with properties id, desc, and providers */

    /*
     * @param {Array of String} keys - the set of keys to be used when retrieving the lookup codes
     * @returns {Jquery.Promise}
     *      @resolve {Array of Objects} - each object is a lookup with id, desc, and providers properties.
     *      @reject {String} descriptive error string
     */
    fetch(keys) {
        var fetchDeferred = $.Deferred();
        var URL = Config.CODES_ENDPOINT + '/' + this.codes;

        $.ajax({
            url: URL + '?' + this.keyParameter + '=' + keys.join(';'),
            type: 'GET',
            data: {
                mimeType: 'json'
            },
            success: (data) => {
                this.cachedData = map(keys, (key) => {
                    var filtered = filter(data.codes, (lookup) => {
                        return this.parseKey(lookup.value) === key;
                    });
                    return {
                        key: key,
                        data: map(filtered, (lookup) => {
                            return {
                                id: lookup.value,
                                desc: has(lookup, 'desc') && lookup.desc ? lookup.desc : lookup.value, // defaults to value
                                providers: lookup.providers
                            };
                        })
                    };
                });
                fetchDeferred.resolve(this.getAll());
            },
            error: (jqXHR, textStatus, error) => {
                log.error('Can\'t get ' + this.codes + ', Server error: ' + error);
                fetchDeferred.reject(error);
            }
        });

        return fetchDeferred.promise();
    }

    /*
     * @return {Array of Object} - Object has id, desc, and providers string properties
     */
    getAll() {
        var all = pluck(this.cachedData, 'data');
        return flatten(all);
    }

    /*
     * @return {Array of String}
     */
    getAllKeys() {
        return pluck(this.cachedData, 'key');
    }

    /*
     * @return {Array of Objects} - Each object is a lookup with id, desc, and providers properties. Return undefined if that key
     * is not in the model
     */
    getDataForKey(key) {
        var isMatch = function (object) {
            return object.key === key;
        };
        var lookup = find(this.cachedData, isMatch);
        if (lookup) {
            return lookup.data;
        } else {
            return undefined;
        }
    }
}
