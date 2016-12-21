/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAl.VIEWS.downloadProgressDialog', function () {
	"use strict";
	var thisDialog;
	var continueSpy;

	beforeEach(function () {
		$('body').append('<div id=progress-dialog class="modal">' +
			'<div class="modal-content">' +
			'<div class="modal-dialog">' +
			'<div class="modal-header"><h4></h4></div>' +
			'<div class="modal-body"></div>' +
			'<div class="modal-footer"></div>' +
			'</div></div></div>');

		thisDialog = PORTAL.VIEWS.downloadProgressDialog($('#progress-dialog'));
		continueSpy = jasmine.createSpy('continueSpy');
	});
	afterEach(function () {
		$('#progress-dialog').remove();
	});

	it('Expects the dialog to be visible with appropriate content and header when show is called', function () {
		thisDialog.show('map');
		expect($('#progress-dialog').is(':visible')).toBe(true);
		expect($('.modal-header h4').html()).toContain('Map Sites');
		expect($('.modal-body').html()).toContain('Please wait');
		expect($('.modal-footer').html()).toEqual('');

		thisDialog.show('download');
		expect($('#progress-dialog').is(':visible')).toBe(true);
		expect($('.modal-header h4').html()).toContain('Download');
		expect($('.modal-body').html()).toContain('Please wait');
		expect($('.modal-footer').html()).toEqual('');
	});

	it('Expects the dialog to be hidden after calling hide', function () {
		thisDialog.show('map', continueSpy);
		thisDialog.hide();
		expect($('#progress-dialog').is(':visible')).toEqual(false);
	});

	describe('Tests for updateProgress when dialog is for map', function () {
		var counts;
		beforeEach(function () {
			spyOn(PORTAL.MODELS.providers, 'getIds').and.returnValue(['DS1', 'DS2']);
			thisDialog.show('map');

			counts = {
				DS1: {
					results: '24',
					sites: '10',
					activities : 0
				},
				DS2: {
					results: '50',
					sites: '20',
					activities : 0
				},
				total: {
					results: '100',
					sites: '50',
					activities : 0
				}
			};
		});

		it('Expects when totalCounts exceed limit that download is canceled', function () {
			counts.total.sites = '250,001';
			thisDialog.updateProgress(counts, 'Station', 'xml', continueSpy);

			expect($('.modal-body').html()).toContain('query is returning more than 250,000 sites');
			expect($('#progress-ok-btn').length).toEqual(1);
			expect($('#progress-cancel-btn').length).toEqual(0);
			expect($('#progress-continue-btn').length).toEqual(0);

			$('#progress-ok-btn').click();
			expect($('#progress-dialog').is(':visible')).toBe(false);
			expect(continueSpy).not.toHaveBeenCalled();
		});

		it('Expects when totalCounts is under limit, that the status message is updated to allow the action', function () {
			counts.total.sites = '249,999';
			thisDialog.updateProgress(counts, 'Station', 'xml', continueSpy);

			expect($('.modal-body').html()).toContain('map the sites');
			expect($('#progress-ok-btn').length).toEqual(0);
			expect($('#progress-cancel-btn').length).toEqual(1);
			expect($('#progress-continue-btn').length).toEqual(1);

			$('#progress-cancel-btn').click();
			expect($('#progress-dialog').is(':visible')).toBe(false);
			expect(continueSpy).not.toHaveBeenCalled();

			thisDialog.show('map');
			thisDialog.updateProgress(counts, 'Station', 'xml', continueSpy);

			$('#progress-continue-btn').click();
			expect(continueSpy).toHaveBeenCalledWith('249,999');
			expect($('#progress-dialog').is(':visible')).toBe(false);
		});
	});

	describe('Tests for updateProgress when dialog is for download', function () {
		var counts;
		beforeEach(function () {
			spyOn(PORTAL.MODELS.providers, 'getIds').and.returnValue(['DS1', 'DS2']);
			thisDialog.show('download');

			counts = {
				DS1: {
					results: '24',
					sites: '10',
					activities: 0,
				},
				DS2: {
					results: '50',
					sites: '20',
					activities : 0,
				},
				total: {
					results: '100',
					sites: '50',
					activities : 0
				}
			};
		});

		it('Expects when the dialog is for downloads and the fileFormat is not xlsx, that the download is always allowed', function () {
			counts.total = {
				sites: '250,001',
				results: '1,123,456',
				activities : 0
			};
			thisDialog.updateProgress(counts, 'Station', 'csv', continueSpy);

			expect($('.modal-body').html()).toContain('download the data');
			expect($('#progress-cancel-btn').length).toEqual(1);
			expect($('#progress-continue-btn').length).toEqual(1);
			expect($('#progress-ok-btn').length).toEqual(0);

			$('#progress-continue-btn').click();
			expect($('#progress-dialog').is(':visible')).toBe(false);
			expect(continueSpy).toHaveBeenCalledWith('250,001');

			thisDialog.show('download', continueSpy);
			thisDialog.updateProgress(counts, 'Result', 'tsv', continueSpy);

			expect($('.modal-body').html()).toContain('download the data');
			expect($('#progress-ok-btn').length).toEqual(0);
			expect($('#progress-cancel-btn').length).toEqual(1);
			expect($('#progress-continue-btn').length).toEqual(1);

			$('#progress-continue-btn').click();

			expect($('#progress-dialog').is(':visible')).toBe(false);
			expect(continueSpy).toHaveBeenCalledWith('1,123,456');
		});

		it('Expects when the dialog is for downloads and the fileFormat is xlsx, that the download is allowed if counts are less than or equal to 1,048,575', function () {
			counts.total = {
				sites: '1,048,574',
				results: '2,000,000',
				activities : 0
			};
			thisDialog.updateProgress(counts, 'Station', 'xlsx', continueSpy);

			expect($('.modal-body').html()).toContain('download the data');
			expect($('#progress-ok-btn').length).toEqual(0);
			expect($('#progress-cancel-btn').length).toEqual(1);
			expect($('#progress-continue-btn').length).toEqual(1);

			$('#progress-continue-btn').click();
			expect($('#progress-dialog').is(':visible')).toBe(false);
			expect(continueSpy).toHaveBeenCalledWith('1,048,574');
		});

		it('Expects when the dialog is for downloads and the fileFormat is xlsx, the download is not allowed if counts are greater than 1048575', function () {
			counts.total = {
				sites: '1,048,574',
				results: '2,000,000',
				activities : 0
			};
			thisDialog.updateProgress(counts, 'Result', 'xlsx', continueSpy);

			expect($('.modal-body').html()).toContain('more than 1,048,575');
			expect($('#progress-ok-btn').length).toEqual(1);
			expect($('#progress-cancel-btn').length).toEqual(0);
			expect($('#progress-continue-btn').length).toEqual(0);

			$('#progress-ok-btn').click();
			expect($('#progress-dialog').is(':visible')).toBe(false);
			expect(continueSpy).not.toHaveBeenCalled();
		});
	});

	it('Expects a call to cancelProgress to show the message and an ok button', function () {
		thisDialog.show('download');
		thisDialog.cancelProgress('Cancel message');
		expect($('.modal-body').html()).toContain('Cancel message');
		expect($('#progress-ok-btn').length).toEqual(1);
		expect($('#progress-cancel-btn').length).toEqual(0);
		expect($('#progress-continue-btn').length).toEqual(0);

		$('#progress-ok-btn').click();
		expect($('#progress-dialog').is(':visible')).toBe(false);
	});
});