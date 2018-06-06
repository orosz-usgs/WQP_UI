/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */
/* global $ */
/* global Config */
/* global PORTAL */

describe('Test identifyDialog', function () {
	"use strict";
	var $dialog;
	var $popover;
	var identifyDialog;
	var closeSpy;


	beforeEach(function () {
		// Create base HTML
		var resultTypeRadioHtml = '<input checked="checked" type="radio" name="resultType" id="dialog-sites" value="Station"><input type="radio" name="resultType" id="dialog-samples" value="Result">' +
			'<input type="radio" name="resultType" id="dialog-biosamples" value="Bio Result">';
		var formHtml = '<form method="get">' +
			'<input type="radio" checked="checked" name="mimeType" id="csv" value="csv">' +
			'<input type="radio" name="mimeType" id="tsv" value="tab">' +
			'<input type="radio" name="mimeType" id="xlsx" value="xlsx">' +
			'<div id="map-id-hidden-input-div"></div>' +
			'</form>';

		var downloadButton = '<button id="download-map-info-button">Download Data</button>';

		var detailDivHtml = '<div id="map-info-details-div"></div>';

		$('body').append('<div id="test-div"><div id="dialog-div">' +
			resultTypeRadioHtml +
			formHtml +
			downloadButton +
			detailDivHtml +
			'</div>' +
			'<div id="map-popover"></div>' +
			'</div>');
		$dialog = $('#dialog-div');
		$popover = $('#map-popover');

		spyOn($dialog, 'dialog').and.callThrough();
		spyOn($popover, 'popover').and.callThrough();

		closeSpy = jasmine.createSpy('closeSpy');

		identifyDialog = PORTAL.VIEWS.identifyDialog({
			$dialog : $dialog,
			$popover : $popover
		});
		identifyDialog.initialize(closeSpy);
	});

	afterEach(function () {
		$('#test-div').remove();
		$('.popover').remove();
		$('.ui-dialog').remove();
	});

	it('Expects that the UI dialog is initialized when initialize is called', function() {
		expect($dialog.dialog).toHaveBeenCalled();
	});

	describe('showDialog tests', function() {
		var features = [{properties :{name: 'Site1'}}, {properties: {name: 'Site2'}}];

		var queryParamArray = [
			{
				name: 'statecode',
				value : 'US:55'
			}, {
				name : 'countycode',
				value : 'US:55:025'
			}
		];
		var boundingBox = [-103, 41, -100, 43];

		it('Expects that if usePopover is true, the popover shows site information, but the ui dialog is not shown', function() {
			var siteContent;
			identifyDialog.showDialog({
				features: features,
				queryParamArray: queryParamArray,
				boundingBox: boundingBox,
				usePopover: true
			});
			expect($dialog.dialog.calls.count()).toBe(1);
			expect($popover.popover.calls.count()).toBe(3);
			expect($popover.popover.calls.argsFor(2)).toEqual(['show']);

			siteContent = $('.popover').html();
			expect(siteContent).toContain('Site1');
			expect(siteContent).toContain('Site2');
		});

		it('Expects that is the popover is shown and then closed, that the close function is executed', function() {
			identifyDialog.showDialog({
				features: features,
				queryParamArray: queryParamArray,
				boundingBox: boundingBox,
				usePopover : true
			});
			expect(closeSpy).not.toHaveBeenCalled();
			$popover.trigger('hide.bs.popover');
			expect(closeSpy).toHaveBeenCalled();
		});

		it('Expects that if usePopover is false, the UI dialog shows site information and it\'s query form contains the siteIds', function() {
			var siteContent;
			var query;

			identifyDialog.showDialog({
				features: features,
				queryParamArray: queryParamArray,
				boundingBox: boundingBox,
				usePopover : false
			});
			expect($dialog.dialog.calls.count()).toBe(2);
			expect($popover.popover.calls.count()).toBe(0);

			siteContent = $('.ui-dialog').html();
			query = $('form').serialize();
			expect(siteContent).toContain('Site1');
			expect(siteContent).toContain('Site2');
			expect(query).toContain('siteid=Site1');
			expect(query).toContain('siteid=Site2');
		});
	});
});

