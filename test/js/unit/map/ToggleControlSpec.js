/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect */
/* global $ */
/* global PORTAL */
/* global ol */

describe('Tests for ToggleControl', function() {
	"use strict";

	var map;
	var $mapDiv;
	var testInteraction;
	var testControl;

	beforeEach(function() {
		$('body').append('<div id="test-map-div"></div>');
		$mapDiv = $('#test-map-div');
		map = new ol.Map({
			view: new ol.View({
				center: ol.proj.fromLonLat('-100, 43'),
				zoom: 3
			}),
			target: 'test-map-div'
		});

		testInteraction = new ol.interaction.Pointer({
		});
		testControl = new PORTAL.MAP.ToggleControl({
			interaction : testInteraction
		});

		map.addInteraction(testInteraction);
		map.addControl(testControl);
	});

	afterEach(function() {
		$mapDiv.remove();
	});

	it('Expects the map div to contain the toggle control and that the interaction will be off', function() {
		var $control = $mapDiv.find('.map-toggle');
		expect($control.length).toBe(1);
		expect($control.find('button.map-toggle-off').length).toBe(1);
		expect(testInteraction.getActive()).toBe(false);
	});

	it('Expects the interaction to be added to the map when the control is clicked', function() {
		var $controlBtn = $mapDiv.find('.map-toggle button');
		$controlBtn.trigger('click');
		expect(testInteraction.getActive()).toBe(true);
		expect($controlBtn.hasClass('map-toggle-on')).toBe(true);
	});

	it('Expects that if the control is clicked twice it will go from active back to inactive', function() {
		var $controlBtn = $mapDiv.find('.map-toggle button');
		$controlBtn.trigger('click');
		$controlBtn.trigger('click');
		expect(testInteraction.getActive()).toBe(false);
		expect($controlBtn.hasClass('map-toggle-off')).toBe(true);
	});
});
