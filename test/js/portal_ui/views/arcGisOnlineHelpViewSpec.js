/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */
/* global $ */
/* global PORTAL */

describe ('Tests for PORTAL.VIEWS.arcGisOnlineHelp', function() {
	"use strict";

	var testView;
	var $testDiv;
	var getQueryParamsSpy;

	beforeEach(function(done) {
		$('body').append('<div id="test-div"></div>');
		$testDiv = $('#test-div');
		$testDiv.append('<div id="test-map-container"><select id="sld-select-input">' +
			'<option value="SLD1" selected>SLD1</option>' +
			'<option value="SLD2">SLD2</option></select>'
		);
		$testDiv.append('<button id="test-button">Button</button>');
		$testDiv.append('<div id=test-dialog class="modal">' +
			'<div class="modal-content">' +
			'<div class="modal-dialog">' +
			'<div class="modal-header"><h4></h4></div>' +
			'<div class="modal-body"></div>' +
			'<div class="modal-footer"></div>' +
			'</div></div></div>'
		);

		getQueryParamsSpy = jasmine.createSpy('getQueryParamsSpy').and.returnValues(
			[
				{name: 'Name1', value: 'Value1'},
				{name: 'Name2', value: 'Value2'}
			], [
				{name: 'Name3', value: 'Value3'}
			]
		);

		spyOn($.fn, 'modal');

		testView = PORTAL.VIEWS.arcGisOnlineHelpView({
			$button: $('#test-button'),
			$dialog: $('#test-dialog'),
			$siteMapViewContainer: $('#test-map-container'),
			getQueryParamArray : getQueryParamsSpy
		});

		testView.initialize();

		/* Allows time for the handlebar template to be loaded */
		setTimeout(function() {
			done();
		}, 100);
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that when the test button is clicked the dialog is shown and has the appropriate content', function() {
		var $searchparams, $style;
		$('#test-button').trigger('click');
		$searchparams = $('.searchparams-value');
		$style = $('.style-value');

		expect($.fn.modal).toHaveBeenCalledWith('show');
		expect($searchparams.html()).toContain('Name1:Value1');
		expect($searchparams.html()).toContain('Name2:Value2');
		expect($style.html()).toEqual('SLD1');
	});

	it('Expects that the second time the test button is clicked the dialog has updated content', function() {
		var $searchparams;
		var $testButton = $('#test-button');
		$testButton.trigger('click');
		$testButton.trigger('click');
		$searchparams =  $('.searchparams-value');

		expect($searchparams.html()).toContain('Name3:Value3');
	});
});