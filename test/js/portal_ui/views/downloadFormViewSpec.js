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
		dataDetailsMock, nldiMock;
	var fetchProvidersDeferred, fetchCountsDeferred;
	var placeInitDeferred, siteParameterInitDeferred, samplingInitDeferred, bioSamplingInitDeferred;
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

		placeInitDeferred = $.Deferred();
		siteParameterInitDeferred = $.Deferred();
		samplingInitDeferred = $.Deferred();
		bioSamplingInitDeferred = $.Deferred();

		placeMock  = {
			initialize : jasmine.createSpy('placeInitialize').and.returnValue(placeInitDeferred)
		};
		boundingBoxMock  = {
			initialize : jasmine.createSpy('boundingBoxInitialize')
		};
		pointLocationMock  = {
			initialize : jasmine.createSpy('pointLocationInitialize')
		};
		siteParameterMock  = {
			initialize : jasmine.createSpy('siteParameterInitialize').and.returnValue(siteParameterInitDeferred)
		};
		samplingParametersMock  = {
			initialize : jasmine.createSpy('samplingParametersInitialize').and.returnValue(samplingInitDeferred)
		};
		biologicalSamplingMock  = {
			initialize : jasmine.createSpy('biologicalSamplingInitialize').and.returnValue(bioSamplingInitDeferred)
		};
		dataDetailsMock  = {
			initialize : jasmine.createSpy('dataDetailsInitialize'),
			getMimeType : function() { return 'csv'; },
			getResultType : function() { return 'Result'; }
		};
		nldiMock = {
			initialize : jasmine.createSpy('nldiInitialize')
		};
		spyOn(PORTAL.VIEWS, 'placeInputView').and.returnValue(placeMock);
		spyOn(PORTAL.VIEWS, 'pointLocationInputView').and.returnValue(pointLocationMock);
		spyOn(PORTAL.VIEWS, 'boundingBoxInputView').and.returnValue(boundingBoxMock);
		spyOn(PORTAL.VIEWS, 'siteParameterInputView').and.returnValue(siteParameterMock);
		spyOn(PORTAL.VIEWS, 'samplingParameterInputView').and.returnValue(samplingParametersMock);
		spyOn(PORTAL.VIEWS, 'biologicalSamplingInputView').and.returnValue(biologicalSamplingMock);
		spyOn(PORTAL.VIEWS, 'dataDetailsView').and.returnValue(dataDetailsMock);
		spyOn(PORTAL.VIEWS, 'nldiView').and.returnValue(nldiMock);

		fetchProvidersDeferred = $.Deferred();
		spyOn(PORTAL.MODELS.providers, 'fetch').and.returnValue(fetchProvidersDeferred);

		fetchCountsDeferred = $.Deferred();
		spyOn(PORTAL.queryServices, 'fetchQueryCounts').and.returnValue(fetchCountsDeferred);

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
		expect(nldiMock.initialize).toHaveBeenCalled();
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

	describe('Tests for promise returned from initialize', function() {
		var initSuccessSpy, initFailSpy;

		beforeEach(function() {
			initSuccessSpy = jasmine.createSpy('initSuccessSpy');
			initFailSpy = jasmine.createSpy('initFailSpy');
			testView.initialize().done(initSuccessSpy).fail(initFailSpy);
		});

		it('Expects the promise to be resolved when all child views have been initialized as well as the providers', function() {
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).not.toHaveBeenCalled();

			fetchProvidersDeferred.resolve();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).not.toHaveBeenCalled();

			placeInitDeferred.resolve();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).not.toHaveBeenCalled();

			siteParameterInitDeferred.resolve();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).not.toHaveBeenCalled();

			samplingInitDeferred.resolve();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).not.toHaveBeenCalled();

			bioSamplingInitDeferred.resolve();
			expect(initSuccessSpy).toHaveBeenCalled();
			expect(initFailSpy).not.toHaveBeenCalled();
		});

		it('Expects the promise to be rejected if the provider view is not successfully initialized', function() {
			fetchProvidersDeferred.reject();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).toHaveBeenCalled();
		});

		it('Expects the promise to be rejected if the placeInput views is not successfully initialized', function() {
			placeInitDeferred.reject();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).toHaveBeenCalled();
		});

		it('Expects the promise to be rejected if the site parameter view is not successfully initialized', function() {
			siteParameterInitDeferred.reject();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).toHaveBeenCalled();
		});

		it('Expects the promise to be rejected if the sampling view is not successfully initialized', function() {
			samplingInitDeferred.reject();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).toHaveBeenCalled();
		});

		it('Expects the promise to be rejected if the bioSampling view is not successfully initialized', function() {
			bioSamplingInitDeferred.reject();
			expect(initSuccessSpy).not.toHaveBeenCalled();
			expect(initFailSpy).toHaveBeenCalled();
		});
	});

	describe('Tests for clicking the download button', function() {
		var success;
		beforeEach(function() {
			spyOn(PORTAL.CONTROLLERS, 'validateDownloadForm').and.callFake(function() { return success;});
			testView.initialize();
		});

		it('Expects that if the form does not validate, the download does not occur', function() {
			success = false;
			$('#main-button').trigger('click');
			expect(mockDownloadDialog.show).not.toHaveBeenCalled();
		});

		it('Expects that if the form does validate, the downloadProgressDialog is shown and a counts request is made', function() {
			success = true;
			$('#main-button').trigger('click');
			expect(mockDownloadDialog.show).toHaveBeenCalled();
			expect(PORTAL.queryServices.fetchQueryCounts).toHaveBeenCalledWith('Result', [ Object({ name: 'fake-param', value: 'Fake1' }) ], [ 'Src1', 'Src2', 'Src3' ]);
		});

		it('Expects that if the count request is successful, the dialog is updated', function() {
			success = true;
			$('#main-button').trigger('click');
			fetchCountsDeferred.resolve({});
			expect(mockDownloadDialog.updateProgress).toHaveBeenCalled();
		});

		it('Expects that if the head request fails, the dialog is canceled', function() {
			success = true;
			$('#main-button').trigger('click');
			fetchCountsDeferred.reject();
			expect(mockDownloadDialog.cancelProgress).toHaveBeenCalled();
		});
	});

});