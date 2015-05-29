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
		placeholder : 'All',
		allowClear : true
	};
	var selectHtml = '';
	var i;

	for (i = 0; i < ids.length; i++) {
		selectHtml += '<option value="' + ids[i] + '">' + ids[i] + '</option>';
	}
	el.append(selectHtml);
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
 *
 * @param {jquery element selecting a hidden input} el
 * @param {Object} spec
 *  spec has the following properties
 @prop {Object} model : object which inherits from PORTAL.MODELS.cachedCodes or PORTAL.MODELS.codesWithKeys
 @prop {Function} isMatch : function with two parameters - data (object with id, desc and providers) and searchTerm - String.
 *     isMatch is optional. By default it will try to match only the descr property
 @prop {Function} formatData : function takes data (object with id, desc, and providers) and produces a select2 result object
 *     with id and text properties. This is optional
 @prop {Function} getKeys : function which when called returns an array of keys used in model.processData.
 * @param {Object} select2Options
 * @returns {undefined}
 */
PORTAL.VIEWS.createCodeSelect = function(
		el /* jquery hidden input elements */, spec /* Object */,
		select2Options /* select2 options which will be merged with defaults */) {
	/*
	 * spec has the following properties
	 * model : object which inherits from PORTAL.MODELS.codes or PORTAL.MODELS.codesWithKeys
	 * isMatch : function with two parameters - data (object with id, desc and providers) and searchTerm - String.
	 *     isMatch is optional. By default it will try to match only the descr property
	 * formatData : function takes data (object with id, desc, and providers) and produces a select2 result object
	 *     with id and text properties. This is optional
	 * getKeys : function which when called returns an array of keys used in model.processData.
	 *
	 */

	// Assign defaults for optional parameters
	if (!('isMatch' in spec)) {
		spec.isMatch = function(data, searchTerm) {
			if (searchTerm) {
				return (data.desc.toUpperCase().indexOf(
						searchTerm.toUpperCase()) > -1);
			} else {
				return true;
			}
		};
	}

	if (!('formatData' in spec)) {
		spec.formatData = function(data) {
			return {
				id : data.id,
				text : data.desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')'
			};
		};
	}

	if (!('getKeys' in spec)) {
		spec.getKeys = function() {
			return;
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
		query : function(options) {
			spec.model.processData(spec.getKeys()).done(function(data) {
				var i, key;
				var results = [];
				var dataArray = [];

				if (length in data && data.length > 0) {
					dataArray = dataArray.concat(data);
				} else {
					for (key in data) {
						if ((data[key]) && data[key].length > 0) {
							dataArray = dataArray.concat(data[key]);
						}
					}
				}

				for (i = 0; i < dataArray.length; i++) {
					if (spec.isMatch(dataArray[i], options.term)) {
						results.push(spec.formatData(dataArray[i]));
					}
				}
				options.callback({
					'results' : results
				});
			});
		}
	};

	el.select2($.extend(defaultOptions, select2Options));
};
