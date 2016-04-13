/* jslint browser : true */
/* global describe, beforeEach, afterEach, it, expect, jasmine */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAL.VIEWS.dataDetailsView', function() {
	"use strict";

	var testView;
	var $testDiv;
	var $kml, $sites, $samples, $biosamples, $sorted, $hiddenSorted;
	var updateResultTypeAction;

	beforeEach(function() {
		$('body').append('<div id="test-div">' +
			'<form>' +
			'<input checked class="result-type" type="radio" id="sites" value="Station" />' +
			'<input class="result-type" type="radio" id="samples" value="Result" />' +
			'<input class="result-type" type="radio" id="biosamples" value="Result" />' +
			'<input type="radio" checked name="mimeType" id="csv" value="csv" />' +
			'<input type="radio" checked name="mimeType" id="tsv" value="tsv" />' +
			'<input type="radio" checked name="mimeType" id="xlsx" value="xlsx" />' +
			'<input type="radio" checked name="mimeType" id="kml" value="kml" />' +
			'<input type="checkbox" id="sorted" />' +
			'<input type="hidden" name="sorted" id="hidden-sorted" value="no" />' +
			'<input type="hidden" name="zip" id="zip" value="yes" />' +
			'</form></div>'
		);
		$testDiv = $('#test-div');
		$kml = $('#kml');
		$sites = $('#sites');
		$samples = $('#samples');
		$biosamples = $('#biosamples');
		$sorted = $('#sorted');
		$hiddenSorted = $('#hidden-sorted');

		updateResultTypeAction = jasmine.createSpy('updateResultTypeAction');

		testView = PORTAL.VIEWS.dataDetailsView({
			$container : $testDiv,
			updateResultTypeAction : updateResultTypeAction
		});
		testView.initialize();
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that if the kml button is checked that the samples and biosamples boxes are disabled', function() {
		$kml.prop('checked', true).trigger('change');
		expect($sites.is(':disabled')).toBe(false);
		expect($samples.is(':disabled')).toBe(true);
		expect($biosamples.is(':disabled')).toBe(true);

		$kml.prop('checked', false).trigger('change');
		expect($sites.is(':disabled')).toBe(false);
		expect($samples.is(':disabled')).toBe(false);
		expect($biosamples.is(':disabled')).toBe(false);
	});

	it('Expects that the only one result-type radio button is checked at a time', function() {
		$samples.prop('checked', true).trigger('change');
		expect($sites.is(':checked')).toBe(false);
		expect($samples.is(':checked')).toBe(true);
		expect($biosamples.is(':checked')).toBe(false);

		$biosamples.prop('checked', true).trigger('change');
		expect($sites.is(':checked')).toBe(false);
		expect($samples.is(':checked')).toBe(false);
		expect($biosamples.is(':checked')).toBe(true);

		$sites.prop('checked', true).trigger('change');
		expect($sites.is(':checked')).toBe(true);
		expect($samples.is(':checked')).toBe(false);
		expect($biosamples.is(':checked')).toBe(false);
	});

	it('Expects that if the result-type radio button is changed, updateResultTypeAction is executed', function() {
		$samples.prop('checked', true).trigger('change');
		expect(updateResultTypeAction).toHaveBeenCalledWith('Result');

		$biosamples.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(2);
		expect(updateResultTypeAction.calls.argsFor(1)[0]).toEqual('Result');

		$sites.prop('checked', true).trigger('change');
		expect(updateResultTypeAction.calls.count()).toBe(3);
		expect(updateResultTypeAction.calls.argsFor(2)[0]).toEqual('Station');
	});

	it('Expects that if the biosamples radio button is checked, a hidden input is added with name dataProfile', function() {
		$biosamples.prop('checked', true).trigger('change');
		expect($testDiv.find('input[type="hidden"][name="dataProfile"]').length).toBe(1);

		$sites.prop('checked', true).trigger('change');
		expect($testDiv.find('input[type="hidden"][name="dataProfile"]').length).toBe(0);
	});

	it('Expects that changing the sort checkbox updates the hidden sorted input', function() {
		$sorted.prop('checked', true).trigger('change');
		expect($hiddenSorted.val()).toEqual('yes');

		$sorted.prop('checked', false).trigger('change');
		expect($hiddenSorted.val()).toEqual('no');
	});

	it('Expects that getResultType returns the currently selected result type', function() {
		$samples.prop('checked', true).trigger('change');
		expect(testView.getResultType()).toEqual('Result');

		$sites.prop('checked', true).trigger('change');
		expect(testView.getResultType()).toEqual('Station');
	});

	it('Expects that getMimeType returns the currently selected mime type', function() {
		$('#xlsx').trigger('click');
		expect(testView.getMimeType()).toEqual('xlsx');

		$('#tsv').trigger('click');
		expect(testView.getMimeType()).toEqual('tsv');
	});
});
