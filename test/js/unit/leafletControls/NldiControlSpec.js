/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */
/* global L */
/* global $ */

describe('leafletControl/NldiControl', function() {
	"use strict";

	var $testDiv;
	var map;
	var testControl;
	var navChangeHandlerSpy, distanceChangeHandlerSpy;

	beforeEach(function() {
		$('body').append('<div id="test-div" style="height: 30px; width: 30px"></div>');
		$testDiv = $('#test-div');

		navChangeHandlerSpy = jasmine.createSpy('navChangeHandler');
		distanceChangeHandlerSpy = jasmine.createSpy('distanceChangeHandler');

		map = L.map('test-div', {
			center : [43.0, -100.0],
			zoom : 4
		});
		testControl = L.control.nldiControl({
			navChangeHandler : navChangeHandlerSpy,
			distanceChangeHandler : distanceChangeHandlerSpy
		});
	});

	afterEach(function() {
		map.remove();
		$testDiv.remove();
	});

	it('Expects that by the nav control is added to the map', function() {
		map.addControl(testControl);
		expect($testDiv.find('.leaflet-nldi-input-div').length).toBe(1);
	});
	
	// Unable to test the event handler because triggering the 'change' programatically did not trigger the leaflet event listener.

	it('Expects that if the nav control is removed from the map, the handler\'s listeners are removed', function() {
		map.addControl(testControl);
		spyOn(L.DomEvent, 'removeListener').and.callThrough();
		map.removeControl(testControl);
		expect(L.DomEvent.removeListener.calls.count()).toBe(2);
		expect(L.DomEvent.removeListener.calls.argsFor(0)[2]).toBe(navChangeHandlerSpy);
		expect(L.DomEvent.removeListener.calls.argsFor(1)[2]).toBe(distanceChangeHandlerSpy);
	});

});