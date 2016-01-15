/*global describe */
/*global describe, it, beforeEach, afterEach, expect, jasmine, spyOn */
/*global $ */
/*global PORTAL */
/*global Config */
/*global sinon */
/*global alert */

xdescribe('Test PORTAL.VIEWS.placeSelects', function () {
	"use strict";
	var placeSelects;

	beforeEach(function () {
		Config.CODES_ENDPOINT = 'test/lookups';

		var countryHtml = '<select name="countrycode" id="country-select" multiple></select>';
		var stateHtml = '<select name="statecode" id="state-select" multiple></select>';
		var countyHtml = '<select name="countycode" id="county-select" multiple></select>';

		$('body').append('<div id="test-div"><form>' +
			countryHtml + stateHtml + countyHtml +
			'</form></div>');
		placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));
	});

	afterEach(function () {
		Config.CODES_ENDPOINT = '';
		$('#country-select').select2('destroy');
		$('#state-select').select2('destroy');
		$('#county-select').select2('destroy');
		$('#test-div').remove();
	});

	it('Expects placeSelects.getCountries to reflect the current countries set', function () {
		expect(placeSelects.getCountries()).toEqual(['US']);
		$('#country-select').val(['US', 'CN']).trigger('change');
		expect(placeSelects.getCountries()).toEqual(['US', 'CN']);
	});

	it('Expects placeSelects.getStates to reflect the current states set', function () {

		expect(placeSelects.getStates()).toEqual([]);
		$('#state-select').select2('data', [{id: 'US:55'}, {id: 'US:02'}, {id: 'CN:01'}]);
		expect(placeSelects.getStates()).toEqual(['US:55', 'US:02', 'CN:01']);
	});

	it('Expects placeSelects.getCounties to reflect the current counties set', function () {
		placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));

		expect(placeSelects.getCounties()).toEqual([]);
		$('#county-select').select2('data', [{id: 'US:55:01'}, {id: 'US:55:02'}, {id: 'US:02:01'}]);
		expect(placeSelects.getCounties()).toEqual(['US:55:01', 'US:55:02', 'US:02:01']);
	});

	it('Expects the county select to be updated when the state is updated to eliminate removed states', function () {
		placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));

		$('#county-select').select2('data', [{id: 'US:01:01'}, {id: 'US:02:01'}, {id: 'US:02:02'}], true);
		$('#state-select').select2('data', [{id: 'US:02'}, {id: 'US:03'}], true);

		expect($('#county-select').select2('data')).toEqual([{id: 'US:02:01'}, {id: 'US:02:02'}]);
	});

	it('Expects the state select to be updated when the country is updated to eliminate removed countries', function () {
		placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));

		$('#state-select').select2('data', [{id: 'CN:01'}, {id: 'US:02'}, {id: 'US:03'}], true);
		$('#country-select').select2('data', [{id: 'US'}], true);

		expect($('#state-select').select2('data')).toEqual([{id: 'US:02'}, {id: 'US:03'}]);
	});

	it('If no states have been selected, expect opening the county select shows the alert window', function () {
		placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));

		var openSpy = jasmine.createSpy('openSpy');
		$('county-select').on('select2-open', openSpy);

		spyOn(window, 'alert');
		$('#county-select').select2('open');
		expect(alert).toHaveBeenCalled();
		expect(openSpy).not.toHaveBeenCalled();
	});

	describe('Tests for the isMatch functions used when searching the lists', function () {
		var countryData = {
			id: 'US',
			desc: 'United States',
			providers: 'P1'
		};
		var stateDataUS = {
			id: 'US:02',
			desc: 'US, Alaska',
			providers: 'P1'
		};
		var stateDataNotUS = {
			id: 'CN:01',
			desc: 'Canada, Alberta',
			providers: 'P1'
		};
		var countyData = {
			id: 'US:55:01',
			desc: 'Wisconsin, Adams',
			providers: 'P1'
		};

		beforeEach(function () {
			placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));
		});

		it('Expects empty searchTerm to return true of all is*Match functions', function () {
			expect(placeSelects.isCountryMatch(countryData, '')).toEqual(true);
			expect(placeSelects.isStateMatch(stateDataUS, '')).toEqual(true);
			expect(placeSelects.isCountyMatch(countyData, '')).toEqual(true);
		});

		it('Expects country match to search both the id and the desc', function () {
			expect(placeSelects.isCountryMatch(countryData, 'us')).toEqual(true);
			expect(placeSelects.isCountryMatch(countryData, 'states')).toEqual(true);
			expect(placeSelects.isCountryMatch(countryData, 'c')).toEqual(false);
		});

		it('Expects state match for us states to use postal code in id and search state name part of desc', function () {
			expect(placeSelects.isStateMatch(stateDataUS, 'ak')).toEqual(true);
			expect(placeSelects.isStateMatch(stateDataUS, 'ka')).toEqual(true);
			expect(placeSelects.isStateMatch(stateDataUS, 'us')).toEqual(false);
		});

		it('Expects state match for non us state to use state name part of the desc field', function () {
			expect(placeSelects.isStateMatch(stateDataNotUS, 'al')).toEqual(true);
			expect(placeSelects.isStateMatch(stateDataNotUS, 'c')).toEqual(false);
		});

		it('Expects county match for us states to use county name field', function () {
			expect(placeSelects.isCountyMatch(countyData, 'a')).toEqual(true);
			expect(placeSelects.isCountyMatch(countyData, 'w')).toEqual(false);
		});
	});

	describe('Tests for formatSelection function', function () {
		beforeEach(function () {
			spyOn($.fn, 'select2');
			placeSelects = PORTAL.VIEWS.placeSelects($('#country-select'), $('#state-select'), $('#county-select'));
		});

		it('Expects formatSelection for countries to return the id', function () {
			var formatSelect = $.fn.select2.calls[0].args[0].formatSelection;

			expect(formatSelect({id: 'V1', text: 'Verbose 1'})).toEqual('V1');
		});

		it('Expects formatSelection for states to return the id if not an US state', function () {
			var formatSelect = $.fn.select2.calls[1].args[0].formatSelection;
			expect(formatSelect({id: 'V1:01', text: 'Verbose 1:01'})).toEqual('V1:01');
		});

		it('Expects formatSelection to use postal codes for US states', function () {
			var formatSelect = $.fn.select2.calls[1].args[0].formatSelection;
			expect(formatSelect({id: 'US:55', text: 'US, Wisconsin'})).toEqual('US:WI');
		});

		it('Expects formatSelection for counties to return the id if not in a US state', function () {
			var formatSelect = $.fn.select2.calls[2].args[0].formatSelection;
			expect(formatSelect({id: 'V1:01:01', text: 'Verbose state, 01'})).toEqual('V1:01:01');
		});

		it('Expects formatSelection for counties to return the id with the postal code substituted for the state if the country is US', function () {
			var formatSelect = $.fn.select2.calls[2].args[0].formatSelection;
			expect(formatSelect({id: 'US:55:01', text: 'Wisconsin, Adams County'})).toEqual('US:WI:01');
		});
	});

});