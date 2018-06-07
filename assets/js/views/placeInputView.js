import contains from 'lodash/collection/contains';
import filter from 'lodash/collection/filter';
import has from 'lodash/object/has';
import last from 'lodash/array/last';

import InputValidation from './inputValidationView';


var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Initializes and manages the Place inputs
 * @param {Object} options
 *      @prop {Jquery element} $container - div containing the place inputs.
 *      @prop {PORTAL.MODELS.cachedCodes} countryModel
 *      @prop {PORTAL.MODELS.codesWithKeys} statesModel
 *      @prop {PORTAL.MODELS.codesWithKeys} countryModel
 * @returns {Object}
 *      @func initialize
 */
PORTAL.VIEWS.placeInputView = function (options) {
    var self = {};
    var USA = 'US';

    var initializeCountrySelect = function($select, model) {
        var isMatch = function (searchTerm, lookup) {
            var termMatcher;

            if (searchTerm) {
                termMatcher = new RegExp(searchTerm, 'i');
                return termMatcher.test(lookup.id) || termMatcher.test(lookup.desc);
            } else {
                return true;
            }
        };
        var templateSelection = function(selectData) {
            if (has(selectData, 'id')) {
                return selectData.id;
            } else {
                return null;
            }
        };

        var spec = {
            model: model,
            isMatch: isMatch
        };

        PORTAL.VIEWS.createCodeSelect($select, spec, {
            templateSelection: templateSelection
        });
    };

    var initializeStateSelect = function($select, model, getCountryKeys) {
        var isMatch = function (searchTerm, lookup) {
            var termMatcher;
            var codes;
            if (searchTerm) {
                termMatcher = new RegExp(searchTerm, 'i');
                codes = lookup.id.split(':');
                return termMatcher.test(lookup.id) ||
                    termMatcher.test(lookup.desc) ||
                    termMatcher.test(window.stateFIPS.getPostalCode(codes[1]));
            } else {
                return true;
            }
        };
        var spec = {
            model: model,
            isMatch: isMatch,
            getKeys: getCountryKeys
        };

        var templateSelection = function(selectData) {
            var codes;
            var result;
            if (has(selectData, 'id')) {
                codes = selectData.id.split(':');

                if (codes[0] === USA) {
                    result = codes[0] + ':' + window.stateFIPS.getPostalCode(codes[1]);
                } else {
                    result = selectData.id;
                }
            } else {
                result = null;
            }
            return result;
        };

        PORTAL.VIEWS.createCascadedCodeSelect($select, spec, {
            templateSelection: templateSelection
        });
    };

    var initializeCountySelect = function($select, model, getStateKeys) {
        var isMatch = function(searchTerm, lookup) {
            var termMatcher;
            var county;
            if (searchTerm) {
                termMatcher = new RegExp(searchTerm, 'i');
                county = last(lookup.desc.split(','));
                return termMatcher.test(county);
            } else {
                return true;
            }
        };
        var countySpec = {
            model: model,
            isMatch: isMatch,
            getKeys: getStateKeys
        };

        var templateSelection = function(selectData) {
            var codes;
            var result;

            if (has(selectData, 'id')) {
                codes = selectData.id.split(':');

                if (codes[0] === 'US') {
                    result = codes[0] + ':' + window.stateFIPS.getPostalCode(codes[1]) + ':' + codes[2];
                } else {
                    result = selectData.id;
                }
            } else {
                result = null;
            }
            return result;
        };

        PORTAL.VIEWS.createCascadedCodeSelect($select, countySpec, {
            templateSelection: templateSelection
        });
    };

    /*
     * Initialize the select2's and add event handlers
     * @return Jquery promise
     *      @resolve - When all models have been fetched successfully
     *      @reject - If any of the fetches failed.
     */
    self.initialize = function() {
        //Initialize select els
        var $countrySelect = options.$container.find('#countrycode');
        var $stateSelect = options.$container.find('#statecode');
        var $countySelect = options.$container.find('#countycode');

        //Fetch initial model data
        var fetchCountries = options.countryModel.fetch();
        var fetchUSStates = options.stateModel.fetch([USA]);
        var fetchComplete = $.when(fetchCountries, fetchUSStates);

        options.stateModel.fetch([USA]);

        var getCountryKeys = function () {
            var results = $countrySelect.val();
            return results.length > 0 ? results : [USA];
        };

        var getStateKeys = function() {
            var results = $stateSelect.val();
            return results.length > 0 ? results : [];
        };

        //Initialize select2s
        fetchCountries.done(function() {
            initializeCountrySelect($countrySelect, options.countryModel);
        });
        // Don't need to wait for stateModel to finish loading as the model is checked before display to see if
        // more data needs to be loaded
        initializeStateSelect($stateSelect, options.stateModel, getCountryKeys);

        initializeCountySelect($countySelect, options.countyModel, getStateKeys);

        //Add event handlers
        $countrySelect.on('change', function (ev) {
            /* update states */
            var countries = $(ev.target).val();
            var states = $stateSelect.val();
            var isInCountries = function(state) {
                var countryCode = state.split(':')[0];
                return contains(countries, countryCode);
            };

            if (!countries) {
                countries = [USA];
            }
            $stateSelect.val(filter(states, isInCountries)).trigger('change');
        });

        $stateSelect.on('change', function (ev) {
            var states = $(ev.target).val();
            var counties = $countySelect.val();
            var isInStates = function(county) {
                var codes = county.split(':');
                var stateCode = codes[0] + ':' + codes[1];
                return contains(states, stateCode);
            };

            $countySelect.val(filter(counties, isInStates)).trigger('change');
        });
        new InputValidation({
            inputEl : $countySelect,
            validationFnc : function(val, ev) {
                var result;
                if (getStateKeys().length === 0) {
                    ev.preventDefault();
                    result  = {
                        isValid : false,
                        errorMessage : 'Please select at least one state'
                    };
                } else {
                    result = {
                        isValid : true
                    };
                }
                return result;
            },
            event : 'select2:opening'
        });

        return fetchComplete;
    };

    return self;
};


