/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global PORTAL */

describe('Tests for pointLocationInputView', function() {
	"use strict";

	var testView;
	var $testDiv, $within, $lat, $lon;

	beforeEach(function() {
		$('body').append('<div id="test-div">' +
			'<input type="text" id="within" />' +
			'<input type="text" id="lat" />' +
			'<input type="text" id="long" />' +
			'<div id="useMyLocation"></div>' +
			'</div>');
		$testDiv = $('#test-div');
		$within = $('#within');
		$lat = $('#lat');
		$lon = $('#long');

		testView = PORTAL.VIEWS.pointLocationInputView({
			$container : $testDiv
		});
	});

	afterEach(function() {
		$('#test-div').remove();
	});

	it('Expects that all text inputs will flag non numeric inputs', function() {
		testView.initialize();

		$within.val('abc').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);

		$within.val('123').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);

		$lat.val('abc').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);

		$lat.val('123').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);

		$lon.val('abc').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);

		$lon.val('123').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);
	});

	// Can't seem to mock the navigator object so can't test the geolocation code.
});