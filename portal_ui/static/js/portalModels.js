var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};
/*
 *
 * @param {Object} options
 * 		@props {String} codes - String used in the url to retrieve the model's data.
 * @returns {PORTAL.MODELS.cachedCodes}
 *      @prop {function} fetch - function that returns a promise. If resolved, returns the array of codes data.
 *          @resolved - {Array} - data returned from the fetch
 *          @rejected - {String} - descriptive error message
 *      @prop {function} getData - Returns {Array} from the last successful call to fetch or the empty array if no
 *          successful calls have yet been made.
 *
 */
PORTAL.MODELS.cachedCodes = function(options) {
    var self = {};

    var cachedData = [];

	var URL = Config.CODES_ENDPOINT + '/' + options.codes;

    /*
     * 
     * @return {$.Deferred.promise}. A resolved promise returns {Array of Object} where each object
     * has String properties: id, desc, and providers. A rejected promise returns {String} with the error message.
     */
    self.fetch = function() {
		var fetchDeferred = $.Deferred();
		$.ajax({
			url: URL,
			type: 'GET',
			data : {
				mimeType : 'json'
			},
			success : function(data, textStatus, jqXHR) {
				cachedData = _.map(data.codes, function(code) {
					return {
						id : code.value,
						desc : (_.has(code, 'desc') && (code.desc)) ? code.desc : code.value, // defaults to value
						providers : code.providers
					}
				});

				fetchDeferred.resolve(cachedData);
			},

			error : function(jqXHR, textStatus, error) {
				alert('Can\'t  get ' + spec.codes + ', Server error: ' + error);
				fetchDeferred.reject(error);
			}
		});
        return fetchDeferred.promise();
    };

	self.getAll  = function() {
		return cachedData;
	}

	self.getLookup = function(id) {
		return _.find(cachedData, function(lookup) {
			return (lookup.id === id);
		});
	}

    return self;
};
/*
 *
 * @param {Object} options -
 *          @prop {String} codes - Used in the ajax url to retrieve the data
 *          @prop {String} keyParameter - the parameter name to use to retrieve the appropriate data subset
 *          @prop {Function} parseKey - function takes a lookup item and returns a string for the key it represents.
 * @returns {PORTAL.MODELS.codesWithKeys}
 *          @prop {Function} fetch -
 *          	@param {Array of String} keys
 *          	@returns {$.Deferred.promise}. When resolved will contain the data requested.
 *          	If rejected contains a descriptive error string
 * 			@prop {Function} getAll
 *				@returns {Array of Objects} - each object has two properties. key is a string indicating the data's key and
 * 					data which is an array of lookups, with id, desc, and providers properties.
 *
 */
PORTAL.MODELS.codesWithKeys = function(options) {
    var self = {};

    var cachedData = []; /* Each object where each value is an array of objects with properties id, desc, and providers */

	var URL = Config.CODES_ENDPOINT + '/' + options.codes;
	/*
	 * @param {Array of String} keys - the set of keys to be used when retrieving the lookup codes
	 * @returns {Jquery.Promise}
	 * 		@resolved - the cached Data object
	 * 		@rejected - descriptive error string
	 */
	self.fetch = function(keys) {
		var fetchDeferred = $.Deferred();

		$.ajax({
			url : URL + '?' + options.keyParameter + '=' + keys.join(';'),
			type: 'GET',
			data : {
				mimeType : 'json'
			},
			success : function(data, textStatus, jqXHR) {
				cachedData = _.map(keys, function(key) {
					return {
						key : key,
						data : _.chain(data.codes)
							.filter(function(lookup) {
								return (options.parseKey(lookup.value) === key);
							})
							.map(function(lookup) {
								return {
									id : lookup.value,
									desc : (_.has(lookup, 'desc') && (lookup.desc)) ? lookup.desc : lookup.value, // defaults to value
									providers : lookup.providers
								}
							})
							.value()
					}
				});
				fetchDeferred.resolve(cachedData);
			},
			error : function(jqXHR, textStatus, error) {
				alert("Can't get " + spec.codes + ', Server error: ' + error);
				fetchDeferred.reject(error);
			}
		});

		return fetchDeferred.promise();
	};

	self.getAll = function() {
		return cachedData;
	}


    return self;
};

// Objects that represent the available values for portal selections.
PORTAL.MODELS.countryCodes = PORTAL.MODELS.cachedCodes({codes : 'countrycode'});
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

PORTAL.MODELS.siteType = PORTAL.MODELS.cachedCodes({codes : 'sitetype'});
PORTAL.MODELS.organization = PORTAL.MODELS.cachedCodes({codes : 'organization'});
PORTAL.MODELS.sampleMedia = PORTAL.MODELS.cachedCodes({codes : 'samplemedia'});
PORTAL.MODELS.characteristicType = PORTAL.MODELS.cachedCodes({codes : 'characteristictype'});
PORTAL.MODELS.assemblage = PORTAL.MODELS.cachedCodes({codes : 'assemblage'});
