import has from 'lodash/object/has';
import isEqual from 'lodash/lang/isEqual';
import map from 'lodash/collection/map';
import filter from 'lodash/collection/filter';

import providers from '../providers';


/*
 * @param {jquery element for select} el
 * @param {Array of Strings} ids -  to be used for select options
 * @param {Object} select2Options
 * @param {Array of String} initValues
 */
export class StaticSelect2 {
    constructor(el, ids, select2Options, initValues=[]) {
        var defaultOptions = {
            allowClear: true,
            theme: 'bootstrap',
            data: map(ids, function (id) {
                return {id: id, text: id, selected: initValues.includes(id)};
            })
        };
        el.select2($.extend({}, defaultOptions, select2Options));
    }
}

/*
 * Creates a select2 which uses pageing and dynamic querying
 * @param {jquery element} el - selecting a hidden input
 * @param {Object} spec
 *    @prop {String} codes - String used in the url to retrieve the select2's data.
 *    @prop {Number} pagesize (optional) - page size to use in request. Defaults to 20
 *    @prop {Function} formatData (optional) - Function takes an Object with value, desc (optional), and providers properties and returns a string.
 * @param {Object} select2Options
 * @param {jquery element} $filter (optional) input, select, or textarea used in filtering the PagedCodeSelect
 * @param {String} parametername - parameter name to be used in additional lookup
 */
export class PagedCodeSelect {
    constructor(el, spec, select2Options, $filter, parametername, initValues=[]) {
        this.spec = spec;
        this.parametername = parametername;

        this.spec.pagesize = this.spec.pagesize ? this.spec.pagesize : 20;
        if (!('formatData' in spec)) {
            this.spec.formatData = function (data) {
                var desc = data.hasOwnProperty('desc') && data.desc ? data.desc
                    : data.value;
                return desc + ' (' + providers.formatAvailableProviders(data.providers) + ')';
            };
        }
        var defaultOptions = {
            allowClear: true,
            theme: 'bootstrap',
            templateSelection: (object) => {
                return has(object, 'id') ? object.id : null;
            },
            data: initValues.map((id) => {
                return {
                    id: id,
                    text: id,
                    selected: true
                };
            }),
            ajax: {
                url: Config.CODES_ENDPOINT + '/' + this.spec.codes,
                dataType: 'json',
                data: (params) => {
                    return {
                        text: params.term,
                        pagesize: this.spec.pagesize,
                        pagenumber: params.page,
                        mimeType: 'json'
                    };
                },
                delay: 250,
                processResults: (data, params) => {
                    var results = map(data.codes, (code) => {
                        return {
                            id: code.value,
                            text: this.spec.formatData(code)
                        };
                    });
                    var page = params.page || 1;

                    return {
                        results: results,
                        pagination: {
                            more : this.spec.pagesize * page < data.recordCount
                        }
                    };
                }
            }
        };

        if ($filter) {
            $filter.on('change', () => {
                var parents = $filter.val();
                var children = el.val();
                var isInOrganization = (child) => {
                    return parents.includes(child);
                };
                el.val(filter(children, isInOrganization)).trigger('change');
                defaultOptions.ajax.url = Config.CODES_ENDPOINT + '/' + this.spec.codes + this.getParentParams(parents);
                el.select2($.extend(defaultOptions, select2Options));
            });
        }

        el.select2($.extend(defaultOptions, select2Options));
    }

    getParentParams(parentValue) {
        var suffix = '';
        //add parentValue to URL, using .join if it is an array and simply appending if a string
        if (parentValue.length > 0) {
            suffix = '?' + this.parametername + '=';
            if (typeof parentValue === 'string') {
                //val() converts arrays to strings if not called on a select multiple. In this case, convert it back.
                if (parentValue.includes(',')) {
                    parentValue = parentValue.split(',');
                } else {
                    suffix += parentValue;
                }
            }
            if (Array.isArray(parentValue)) {
                suffix += parentValue.join('&' + this.parametername + '=');
            }

        }
        return suffix;
    }
}

/*
 @param {jquery element selecting a select input} el
 @param {Object} options
     @prop {Object} model - object which is created by a call to CachedCodes and the data has already been fetched.
     @prop {Function} isMatch - Optional function with two parameters - term {String} which contains the search term and
     lookup {Object} representing an object in model. Should return Boolean
     @prop {Function} formatData - Optional function takes data (object with id, desc, and providers) and produces a select2 result object
     with id and text properties.
 @param {Object} select2Options
 @param {Array of String} initValues
 */
export class CodeSelect {
    constructor(el, options, select2Options, initValues=[]) {
        this.initialize(el, options, select2Options, initValues);
    }

    // This exists solely so it may be mocked in the test suite
    initialize(el, options, select2Options, initValues) {
        var isMatch;
        var defaultOptions;

        // Assign defaults for optional parameters
        if (has(options, 'isMatch')) {
            isMatch = options.isMatch;
        } else {
            isMatch = function (term, lookup) {
                var termMatcher;
                if (term) {
                    termMatcher = new RegExp(term, 'i');
                    return termMatcher.test(lookup.desc);
                } else {
                    return true;
                }
            };
        }
        if (!has(options, 'formatData')) {
            options.formatData = function (data) {
                return {
                    id: data.id,
                    text: data.desc + ' (' + providers.formatAvailableProviders(data.providers) + ')',
                    selected: initValues.includes(data.id)
                };
            };
        }
        const formatData = function(data) {
            let result = options.formatData(data);
            result.selected = initValues.includes(result.id);
            return result;
        };

        //Initialize the select2
        defaultOptions = {
            allowClear: true,
            theme: 'bootstrap',
            matcher: function (term, data) {
                var searchTerm = has(term, 'term') ? term.term : '';
                if (isMatch(searchTerm, options.model.getLookup(data.id))) {
                    return data;
                } else {
                    return null;
                }
            },
            templateSelection: function (data) {
                var result;
                if (has(data, 'id')) {
                    result = data.id;
                } else {
                    result = null;
                }
                return result;
            },
            data: map(options.model.getAll(), formatData)
        };

        el.select2($.extend(defaultOptions, select2Options));
    }
}

/*
 * @param {jquery element selecting a select input} el
 * @param {Object} options
 *      @prop {Object} model - object which is created by a call to CodesWithKeys
 *      @prop {Function} isMatch - Optional function with two parameters - term {Object} which contains a term property for the search term and
 *          data {Object} representing an option. Should return Boolean.
 *      @prop {Function} formatData - Optional function takes data (object with id, desc, and providers) and produces a select2 result object
 *          with id and text properties.
 *      @prop {Function} getKeys - returns an array of keys to use when retrieving valid options for this select.
 *  @param {Object} select2Options
 *  @param {Array of String} initValues
 */
export class CascadedCodeSelect {
    constructor(el, options, select2Options, initValues=[]) {
        this.initialize(el, options, select2Options, initValues);
    }

    initialize(el, options, select2Options, initValues) {
        // Assign defaults for optional parameters
        if (!has(options, 'isMatch')) {
            options.isMatch = function (term, data) {
                var termMatcher;
                if (term) {
                    termMatcher = new RegExp(term.term, 'i');
                    return termMatcher.test(data.id);
                } else {
                    return true;
                }
            };
        }

        if (!has(options, 'formatData')) {
            options.formatData = function (data) {
                return {
                    id: data.id,
                    text: data.desc + ' (' + providers.formatAvailableProviders(data.providers) + ')'
                };
            };
        }
        const initFormatData = function(data) {
            let result = options.formatData(data);
            result.selected = initValues.includes(result.id);
            return result;
        };
        var defaultOptions = {
            allowClear: true,
            theme: 'bootstrap',
            data: map(options.model.getAll(), initFormatData)
        };


        // Set up the ajax transport property to fetch the options if they need to be refreshed,
        // otherwise use what is in the model.
        defaultOptions.ajax = {
            transport: function (params, success, failure) {
                var deferred = $.Deferred();
                var modelKeys = options.model.getAllKeys().sort();
                var selectedKeys = options.getKeys().sort();
                var filteredLookups;

                if (isEqual(modelKeys, selectedKeys)) {
                    filteredLookups = filter(options.model.getAll(), function (lookup) {
                        return options.isMatch(params.data.term, lookup);
                    });
                    deferred.resolve(filteredLookups);
                } else {
                    options.model.fetch(selectedKeys)
                        .done(function (data) {
                            filteredLookups = filter(data, function(lookup) {
                                return options.isMatch(params.data.term, lookup);
                            });
                            deferred.resolve(filteredLookups);
                        })
                        .fail(function () {
                            deferred.reject();
                        });
                }
                deferred.done(success).fail(failure);

                return deferred.promise();
            },
            processResults: function (resp) {
                var result = map(resp, function (lookup) {
                    return options.formatData(lookup);
                });
                return {results: result};
            }
        };

        el.select2($.extend(defaultOptions, select2Options));
    }
}
