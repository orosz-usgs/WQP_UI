/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine */
/* global $ */
/* global PORTAL */
/* global Config */

describe('Tests for PORTAL.VIEWS.showAPIViewSpec', function() {
	"use strict";

	var $testDiv;
	var testView;
	var mockGetQueryParamArray;

	beforeEach(function() {
		// The below line can be removed once the feature toggle for activity endpoints has been removed.
		Config.ACTIVITY_ENDPOINTS_ENABLED = true;
		$('body').append('<div id="test-div">' +
			'<button type="button"  id="show-queries-button"></button>' +
				'<div id="sites-query-div"><textarea></textarea></div>' +
				'<div id="results-query-div"><textarea></textarea></div>' +
				'<div id="getfeature-query-div"><textarea></textarea></div>' +
				'<div id="activitymetrics-query-div"><textarea></textarea></div>' +
				'<div id="activities-query-div"><textarea></textarea></div>' +
				'<div id="resultdetection-query-div"><textarea></textarea></div>' +
				'</div>'
		);
		$testDiv = $('#test-div');

		mockGetQueryParamArray = jasmine.createSpy('mockGetQueryParamArray').and.returnValue([
			{name : 'Testparam1', value : 'value1'},
			{name : 'Testparam2', value : 'value2'}
		]);

		testView = PORTAL.VIEWS.showAPIView({
			$container : $testDiv,
			getQueryParamArray : mockGetQueryParamArray
		});
		testView.initialize();
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that clicking on the show-queries-button fills in the text areas appropriately', function() {
		$('#show-queries-button').trigger('click');
		expect($('#sites-query-div textarea').html()).toContain('Station?Testparam1=value1&amp;Testparam2=value2');
		expect($('#results-query-div textarea').html()).toContain('Result?Testparam1=value1&amp;Testparam2=value2');
		expect($('#getfeature-query-div textarea').html()).toContain('SEARCHPARAMS=' + encodeURIComponent('Testparam1:value1;Testparam2:value2'));
		expect($('#activitymetrics-query-div textarea').html()).toContain('ActivityMetric?Testparam1=value1&amp;Testparam2=value2');
		expect($('#activities-query-div textarea').html()).toContain('Activity?Testparam1=value1&amp;Testparam2=value2');
	});
});

