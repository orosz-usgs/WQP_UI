/*jslint browser: true */
/*global _*/
/*global $*/
/*global stateFIPS */
/*global alert */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};
/* Initializes the place select2's. Returns an object with property functions,
 * getCountries, getStates, and getCounties which return the current selections.
 *
 * @param {jquery element for select} countryEl
 * @param {jquery element for select} stateEl
 * @param {jquery element for select} countyEl
 * @returns {PORTAL.VIEWS.placeSelects}
 * 		@prop {Function} getCountries
 * 		@prop {Function} getStates
 *		@prop {Function} getCounties
 */
PORTAL.VIEWS.placeInputView = function () {
	"use strict";

	var self = {};
	var USA = 'US';

	/*
	 * @param {Jquery element} $container - div containing the place inputs.
	 */
	self.initialize = function($container) {

	}

	/*
	 * @ returns an array of currently selected countries
	 */
	that.getCountries = function () {
		var results = countryEl.val();
		if (!results) {
			results = ['US'];
		}
		return results;
	};

	/*
	 * @returns an array of currently selected states
	 */
	that.getStates = function () {
		var results = stateEl.val();
		if (!results) {
			results = [];
		}
		return results;
	};

	/*
	 * @returns an array of currently selected counties
	 */
	that.getCounties = function () {
		var results = countyEl.val();
		if (!results) {
			results = [];
		}
		return results;
	};

	/* Putting the isMatch functions in the returned object for ease of testing
	 * @param {Object with id, desc, and providers properties} data
	 * @param {String} searchTerm
	 * @returns boolean
	 */
	that.isCountryMatch = function (searchTerm, data) {
		var termMatcher;
		var lookup;
		if (_.has(searchTerm, 'term') && (searchTerm.term)) {
			termMatcher = new RegExp(searchTerm.term, 'i');
			lookup = PORTAL.MODELS.countryCodes.getLookup(data.id);
			if (termMatcher.test(data.id) || (termMatcher.test(lookup.desc))) {
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

	/*
	 * @param {Object with id, desc, and providers properties} data
	 * @param {String} searchTerm
	 * @returns boolean
	 */
	that.isStateMatch = function (searchTerm, lookup) {
		var termMatcher;
		var codes;
		if (searchTerm) {
			termMatcher = new RegExp(searchTerm, 'i');
			codes = lookup.id.split(':');
			return (termMatcher.test(lookup.id) || (termMatcher.test(lookup.desc)) || termMatcher.test(stateFIPS.getPostalCode(codes[1])));
		}
		else {
			return true;
		}
	};

	/*
	 * @param {Option Object with id, desc, and providers properties} data
	 * @param {String} searchTerm
	 * @returns boolean
	 */
	that.isCountyMatch = function (searchTerm, lookup) {
		var termMatcher;
		var county;
		if (searchTerm) {
			termMatcher = new RegExp(searchTerm, 'i');
			county = _.last(lookup.desc.split(','));
			return termMatcher.test(county);
		}
		else {
			return true;
		}
	};

	/*
	 * Initialize country select2
	 */
	var countrySpec = {
		model: PORTAL.MODELS.countryCodes,
		isMatch: that.isCountryMatch
	};

	PORTAL.VIEWS.createCodeSelect(countryEl, countrySpec, {
		templateSelection: function (country) {
			var result;
			if (_.has(country, 'id')) {
				result = country.id;
			}
			else {
				result = null;
			}
			return result;
		}
	});

	countryEl.on('change', function (e) {
		/* update states */
		var countries = $(e.target).val();
		var states = stateEl.val();

		var newStates;

		if (!countries) {
			countries = ['US'];
		}
		newStates = _.filter(states, function (state) {
			var countryCode = state.split(':')[0];
			return _.contains(countries, countryCode);
		});
		stateEl.val(newStates).trigger('change');
	});

	/*
	 * Initialize state select2
	 */
	var stateSpec = {
		model: PORTAL.MODELS.stateCodes,
		isMatch: that.isStateMatch,
		getKeys: that.getCountries
	};

	PORTAL.VIEWS.createCascadedCodeSelect(stateEl, stateSpec, {
		templateSelection: function (state) {
			var codes;
			var result;
			if (_.has(state, 'id')) {
				codes = state.id.split(':');

				if (codes[0] === 'US') {
					result = codes[0] + ':' + stateFIPS.getPostalCode(codes[1]);
				}
				else {
					result = state.id;
				}
			}
			else {
				result = null;
			}
			return result;
		}
	});

	stateEl.on('change', function (ev) {
		var states = $(ev.target).val();
		var counties = countyEl.val();

		var newCounties = _.filter(counties, function (county) {
			var codes = county.split(':');
			var stateCode = codes[0] + ':' + codes[1];
			return _.contains(states, stateCode);
		});
		countyEl.val(newCounties).trigger('change');

	});

	/*
	 * Initialize count select2
	 */
	var countySpec = {
		model: PORTAL.MODELS.countyCodes,
		isMatch: that.isCountyMatch,
		getKeys: that.getStates
	};

	PORTAL.VIEWS.createCascadedCodeSelect(countyEl, countySpec, {
		templateSelection: function (county) {
			var codes;
			var result;
			if (_.has(county, 'id')) {
				codes = county.id.split(':');

				if (codes[0] === 'US') {
					result = codes[0] + ':' + stateFIPS.getPostalCode(codes[1]) + ':' + codes[2];
				}
				else {
					result = county.id;
				}
			}
			else {
				result = null;
			}
			return result;
		}
	});

	countyEl.on('select2-opening', function (e) {
		if (that.getStates().length === 0) {
			alert('Please select at least one state');

			e.preventDefault();
		}
	});

	return that;
};


