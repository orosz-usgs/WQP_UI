var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * @param {jquery element selecting a hidden input} el
 * @param {Array of Strings to be used for selection options} ids
 * @param {Object} select2Options
 * @returns {undefined}
 */
PORTAL.VIEWS.createStaticSelect2 = function(el, ids, select2Options) {
	var defaultOptions = {
		allowClear : true,
		theme : 'bootstrap',
		data : _.map(ids, function(id) {
			return {id: id, text: id};
		})
	};
	el.select2($.extend({}, defaultOptions, select2Options));
};

/*
 * Creates a select2 which uses pageing and dynamic querying
 * @param {jquery element} el - selecting a hidden input
 * @param {Object} spec
 *    @prop {String} codes - String used in the url to retrieve the select2's data.
 *    @prop {Number} pagesize (optional) - page size to use in request. Defaults to 20
 *    @prop {Function} formatData (optional) - Function takes an Object with value, desc (optional), and providers properties and returns a string.
 * @param {Object} select2Options
 */
PORTAL.VIEWS.createPagedCodeSelect = function(el, spec, select2Options) {
	spec.pagesize = (spec.pagesize) ? spec.pagesize : 20;

	if (!('formatData' in spec)) {
		spec.formatData = function(data) {
			var desc = (data.hasOwnProperty('desc') && (data.desc) ? data.desc
					: data.value);
			return desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')';
		};
	}

	var defaultOptions = {
		placeholder : 'All',
		allowClear : true,
		multiple : true,
		separator : ';',
		formatSelection : function(object, container) {
			return object.id;
		},
		ajax : {
			url : Config.CODES_ENDPOINT + '/' + spec.codes,
			dataType : 'json',
			data : function(term, page) {
				return {
					text : term,
					pagesize : spec.pagesize,
					pagenumber : page,
					mimeType : 'json'
				};
			},
			quietMillis : 250,
			results : function(data, page, query) {
				var results = [];
				$.each(data.codes, function(index, code) {
					results.push({
						id : code.value,
						text : spec.formatData(code)
					});
				});
				return {
					results : results,
					more : ((spec.pagesize * page) < data.recordCount)
				};
			}
		}
	};
	el.select2($.extend(defaultOptions, select2Options));
};
/*
@param {jquery element selecting a select input} el
@param {Object} options
	@prop {Object} model - object which is created by a call to PORTAL.MODELS.cachedCodes
	@prop {Function} isMatch - Optional function with two parameters - term {Object} which contains a term property for the search term and
		data {Object} representing an option. Should return data if the term matches data otherwise return null
	@prop {Function} formatData - Optional function takes data (object with id, desc, and providers) and produces a select2 result object
		  with id and text properties.
@param {Object} select2Options
 */
PORTAL.VIEWS.createCodeSelect = function(el , options, select2Options) {
	var getCodes;

	// Assign defaults for optional parameters
	if (!_.has(options, 'isMatch')) {
		options.isMatch = function(term, data) {
			var termMatcher;
			if (_.has(term, 'term')) {
				termMatcher = RegExp(term.term, 'i');
				if (termMatcher.test(data.id)) {
					return data;
				}
				else {
					return null;
				}
			}
			else {
				return data;
			}
		};
	}

	if (!_.has(options, 'formatData')) {
		options.formatData = function(data) {
			return {
				id : data.id,
				text : data.desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')'
			};
		};
	}

	options.model.fetch().done(function(data) {
		var defaultOptions = {
			allowClear : true,
			theme : 'bootstrap',
			matcher : options.isMatch
		}
		if (_.isArray(data)) {
			defaultOptions.data = _.map(data, options.formatData)
		}
		else {
			defaultOptions.data = _.chain(data)
				.values()
				.map(data, options.formatData)
				.value();
		}

		el.select2($.extend(defaultOptions, select2Options));
	});
};
/*
 * @param {jquery element selecting a select input} el
 * @param {Object} options
 * 		@prop {Object} model - object which is created by a call to PORTAL.MODELS.codesWithKeys
 *		@prop {Function} isMatch - Optional function with two parameters - term {Object} which contains a term property for the search term and
 *			data {Object} representing an option. Should return data if the term matches data otherwise return null
 *		@prop {Function} formatData - Optional function takes data (object with id, desc, and providers) and produces a select2 result object
 *			with id and text properties.
 *		@prop {Function} getKeys - returns an array of keys to use when retrieving valid options for this select.
 *	@param {Object} select2Options
 */
PORTAL.VIEWS.createCascadedCodeSelect = function(el, options, select2Options) {
// Assign defaults for optional parameters
	var defaultOptions = {
		allowClear : true,
		theme : 'bootstrap'
	}
	if (!_.has(options, 'isMatch')) {
		options.isMatch = function(term, data) {
			var termMatcher;
			if (_.has(term, 'term')) {
				termMatcher = RegExp(term.term, 'i');
				if (termMatcher.test(data.id)) {
					return data;
				}
				else {
					return null;
				}
			}
			else {
				return data;
			}
		};
	}

	defaultOptions.matcher = options.isMatch;

	if (!_.has(options, 'formatData')) {
		options.formatData = function(data) {
			return {
				id : data.id,
				text : data.desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')'
			};
		};
	}

	defaultOptions.ajax = {
		transport : function(params, success, failure) {
			var deferred = $.Deferred();
			var modelKeys = _.pluck(PORTAL.MODELS.stateCodes.getAll, 'key').sort();
			var selectedKeys = options.getKeys().sort();
			if (_.isEqual(modelKeys, selectedKeys)) {
				deferred.resolved();
			}
			else {
				options.model.fetch(selectedKeys)
					.done(function(data) {
						deferred.resolve(data);
					})
					.fail(function() {
						deferred.reject();
					})
			}
			deferred.done(success).fail(failure);

			return deferred.promise();
		},
		processResults : function(resp) {
			var result = _.chain(resp)
				.map(function (keyData) {
					return keyData.data;
				})
				.flatten()
				.map(function (lookup) {
					return options.formatData(lookup);
				})
				.value();
			return {results: result};
		}
	}

	el.select2($.extend(defaultOptions, select2Options));
}
