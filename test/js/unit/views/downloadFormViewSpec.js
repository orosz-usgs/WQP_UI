/*jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global _gaq */
/* global PORTAL */

describe('Tests for PORTAL.VIEWS.downloadFormView', function() {
	"use strict";

	var testView;
	var $testDiv;

	var placeMock, boundingBoxMock, pointLocationMock, siteParameterMock, samplingParametersMock, biologicalSamplingMock,
		dataDetailsMock;
	var fetchProvidersDeferred, fetchHeadDeferred;
	var mockDownloadDialog;

	beforeEach(function() {
		$('body').append('<div id="test-div"><form>' +
			'<div id="place"></div>' +
				'<div id="point-location"></div>' +
				'<div id="bounding-box"></div>' +
				'<div id="site-params"></div>' +
				'<div id="sampling"></div>' +
				'<div id="biological"></div>' +
				'<div id="download-box-input-div"></div>' +
				'<select id="providers-select" multiple></select>' +
				'<input type="hidden" name="fake-param" value="Fake1" />' +
				'<div id="mapping-div"><input type="hidden" name="map-param" value="Value1" /></div>' +
				'<button id="main-button" type="submit">Download</button>' +
				'</form></div>'
		);
		$testDiv = $('#test-div');

		placeMock  = {
			initialize : jasmine.createSpy('placeInitialize')
		};
		boundingBoxMock  = {
			initialize : jasmine.createSpy('boundingBoxInitialize')
		};
		pointLocationMock  = {
			initialize : jasmine.createSpy('pointLocationInitialize')
		};
		siteParameterMock  = {
			initialize : jasmine.createSpy('siteParameterInitialize')
		};
		samplingParametersMock  = {
			initialize : jasmine.createSpy('samplingParametersInitialize')
		};
		biologicalSamplingMock  = {
			initialize : jasmine.createSpy('biologicalSamplingInitialize')
		};
		dataDetailsMock  = {
			initialize : jasmine.createSpy('dataDetailsInitialize'),
			getMimeType : function() { return 'csv'; },
			getResultType : function() { return 'Result'; }
		};
		spyOn(PORTAL.VIEWS, 'placeInputView').and.returnValue(placeMock);
		spyOn(PORTAL.VIEWS, 'pointLocationInputView').and.returnValue(pointLocationMock);
		spyOn(PORTAL.VIEWS, 'boundingBoxInputView').and.returnValue(boundingBoxMock);
		spyOn(PORTAL.VIEWS, 'siteParameterInputView').and.returnValue(siteParameterMock);
		spyOn(PORTAL.VIEWS, 'samplingParameterInputView').and.returnValue(samplingParametersMock);
		spyOn(PORTAL.VIEWS, 'biologicalSamplingInputView').and.returnValue(biologicalSamplingMock);
		spyOn(PORTAL.VIEWS, 'dataDetailsView').and.returnValue(dataDetailsMock);

		fetchProvidersDeferred = $.Deferred();
		spyOn(PORTAL.MODELS.providers, 'fetch').and.returnValue(fetchProvidersDeferred);

		fetchHeadDeferred = $.Deferred();
		spyOn(PORTAL.queryServices, 'fetchHeadRequest').and.returnValue(fetchHeadDeferred);

		mockDownloadDialog = {
			show : jasmine.createSpy('mockDownloadShow'),
			updateProgress : jasmine.createSpy('mockUpdateProgress'),
			cancelProgress : jasmine.createSpy('mockCancelProgress')
		};

		spyOn(PORTAL.VIEWS, 'createStaticSelect2');
		spyOn(window, 'alert');
		spyOn(_gaq, 'push');

		testView = PORTAL.VIEWS.downloadFormView({
			$form : $('form'),
			downloadProgressDialog : mockDownloadDialog
		});
	});

	afterEach(function() {
		$('#test-div').remove();
	});

	it('Expects that the sub views are initialized when the view is initialized', function() {
		testView.initialize();
		expect(placeMock.initialize).toHaveBeenCalled();
		expect(pointLocationMock.initialize).toHaveBeenCalled();
		expect(boundingBoxMock.initialize).toHaveBeenCalled();
		expect(siteParameterMock.initialize).toHaveBeenCalled();
		expect(samplingParametersMock.initialize).toHaveBeenCalled();
		expect(biologicalSamplingMock.initialize).toHaveBeenCalled();
		expect(dataDetailsMock.initialize).toHaveBeenCalled();
	});

	it('Expects that the providers are fetched', function() {
		testView.initialize();
		expect(PORTAL.MODELS.providers.fetch).toHaveBeenCalled();
	});

	it('Expects that a successful fetch of the providers initialized the provider select', function() {
		testView.initialize();
		expect(PORTAL.VIEWS.createStaticSelect2).not.toHaveBeenCalled();

		fetchProvidersDeferred.resolve();
		expect(PORTAL.VIEWS.createStaticSelect2).toHaveBeenCalled();
	});

	it('Expects that a failed fetch of the providers does not initialize the select', function() {
		testView.initialize();

		fetchProvidersDeferred.reject();
		expect(PORTAL.VIEWS.createStaticSelect2).not.toHaveBeenCalled();
	});

	it('Expects getQueryParams to return the form parameters, omitting those within the mapping-div', function() {
		expect(testView.getQueryParamArray()).toEqual([{name : 'fake-param', value: 'Fake1'}]);
	});

	describe('Tests for clicking the download button', function() {

		var success;
		beforeEach(function() {
			spyOn(PORTAL.CONTROLLERS, 'validateDownloadForm').and.callFake(function() { return success;});
			spyOn(PORTAL.DataSourceUtils, 'getCountsFromHeader').and.returnValue({});
			testView.initialize();
		});

		it('Expects that if the form does not validate, the download does not occur', function() {
			success = false;
			$('#main-button').trigger('click');
			expect(mockDownloadDialog.show).not.toHaveBeenCalled();
		});

		it('Expects that if the form does validate, the downloadProgressDialog is shown and a head request is made', function() {
			success = true;
			$('#main-button').trigger('click');
			expect(mockDownloadDialog.show).toHaveBeenCalled();
			expect(PORTAL.queryServices.fetchHeadRequest).toHaveBeenCalledWith('Result', 'fake-param=Fake1');
		});

		it('Expects that if the head request is successful, the dialog is updated', function() {
			success = true;
			$('#main-button').trigger('click');
			fetchHeadDeferred.resolve({});
			expect(mockDownloadDialog.updateProgress).toHaveBeenCalled();
		});

		it('Expects that if the head request fails, the dialog is canceled', function() {
			success = true;
			$('#main-button').trigger('click');
			fetchHeadDeferred.reject();
			expect(mockDownloadDialog.cancelProgress).toHaveBeenCalled();
		});
	});

});