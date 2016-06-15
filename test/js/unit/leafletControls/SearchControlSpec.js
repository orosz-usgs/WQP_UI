/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn */
/* global L */
/* global $ */

fdescribe('leafletControl/SearchControl', function() {
	"use strict";

	var FAKE_SERVICE = 'http://fakesearchservice.com/api';

	var $testDiv;
	var map;
	var testControl;

	beforeEach(function() {
		$('body').append('<div id="test-div" style="height: 30px; width: 30px"></div>');
		$testDiv = $('#test-div');

		map = L.map('test-div', {
			center : [43.0, -100.0],
			zoom : 4
		});

		spyOn($.fn, 'select2').and.callThrough();
	});

	afterEach(function() {
		map.remove();
		$testDiv.remove();
	});

	it('Expects that when the control is added to the map, it contains the DOM to implement the control', function() {
		var $control;
		testControl = L.control.searchControl(FAKE_SERVICE);
		map.addControl(testControl);
		$control = $testDiv.find('.leaflet-search-control-div')

		expect($control.length).toBe(1);
		expect($control.find('select').length).toBe(1);
		expect($.fn.select2).toHaveBeenCalled();
		expect($.fn.select2.calls.mostRecent().args[0].ajax.url).toEqual(FAKE_SERVICE);
	});

	//would like to add tests for the handling of the select but can't figure out a way to simulate
	// the user typing three characters to trigger the loading of remote data.

	it('Expects that when the control is removed from the map, that the select2 is destroyed', function() {
		testControl = L.control.searchControl(FAKE_SERVICE);
		map.addControl(testControl);
		$.fn.select2.calls.reset();
		map.removeControl(testControl);

		expect($.fn.select2).toHaveBeenCalledWith('destroy');
	});
});
