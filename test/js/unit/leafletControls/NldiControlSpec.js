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

	it('Expects that by the nldi control is added to the map', function() {
		map.addControl(testControl);
		expect($testDiv.find('.leaflet-nldi-input-div').length).toBe(1);
	});

	it('Expects that calling setNavValue updates the value of the navigation input', function() {
		var navEl;
		map.addControl(testControl);
		navEl = document.getElementsByClassName('leaflet-nldi-nav-picker')[0];
		testControl.setNavValue('UT');

		expect(navEl.value).toEqual('UT');

		testControl.setNavValue('');
		expect(navEl.value).toEqual('');
	});

	it('Expects that calling setDistanceValue updates the value of the distance input', function() {
		var distanceEl;
		map.addControl(testControl);
		distanceEl = document.getElementsByClassName('leaflet-nldi-distance-input')[0];
		testControl.setDistanceValue('1234');

		expect(distanceEl.value).toEqual('1234');

		testControl.setDistanceValue('');
		expect(distanceEl.value).toEqual('');
	});

	it('Expects that if the navigation is changed, the nav change handler is called', function() {
		var navEl;
		var event = document.createEvent('HTMLEvents');
		map.addControl(testControl);
		navEl = document.getElementsByClassName('leaflet-nldi-nav-picker')[0];
		navEl.value = 'UM';
		event.initEvent('change', true, false);

		expect(navChangeHandlerSpy).not.toHaveBeenCalled();
		navEl.dispatchEvent(event);
		expect(navChangeHandlerSpy).toHaveBeenCalled();
	});

	it('Expects that if the distance is changed, the distance change handler is called', function() {
		var distanceEl;
		var event = document.createEvent('HTMLEvents');
		map.addControl(testControl);
		distanceEl = document.getElementsByClassName('leaflet-nldi-distance-input')[0];
		distanceEl.value = '123';
		event.initEvent('change', true, false);

		expect(distanceChangeHandlerSpy).not.toHaveBeenCalled();
		distanceEl.dispatchEvent(event);
		expect(distanceChangeHandlerSpy).toHaveBeenCalled();
	});

	it('Expects that if the nldi control is removed from the map, the handler\'s listeners are removed', function() {
		map.addControl(testControl);
		spyOn(L.DomEvent, 'removeListener').and.callThrough();
		map.removeControl(testControl);
		expect(L.DomEvent.removeListener.calls.count()).toBe(2);
		expect(L.DomEvent.removeListener.calls.argsFor(0)[2]).toBe(navChangeHandlerSpy);
		expect(L.DomEvent.removeListener.calls.argsFor(1)[2]).toBe(distanceChangeHandlerSpy);
	});

});