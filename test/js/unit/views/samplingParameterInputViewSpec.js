/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAL.VIEWS.samplingParameterInputView', function() {
	"use strict";

	var testView;
	var $testDiv;
	var $sampleMedia, $characteristicType, $characteristicName, $projectCode, $startDate, $endDate;
	var sampleMediaModel, characteristicTypeModel;
	var fetchSampleMediaDeferred, fetchCharacteristicTypeDeferred;

	beforeEach(function() {
		$('body').append('<div id="test-div">' +
			'<select multiple id="sampleMedia"></select>' +
				'<select multiple id="characteristicType"></select>' +
				'<select multiple id="characteristicName"></select>' +
				'<select multiple id="project-code"></select>' +
				'<input type="text" id="pCode" \>' +
				'<input type="text" id="startDateLo" \>' +
				'<input type="text" id="startDateHi" \>' +
				'</div>'
		);
		$testDiv = $('#test-div');
		$sampleMedia = $('#sampleMedia');
		$characteristicType = $('#characteristicType');
		$characteristicName = $('#characteristicName');
		$projectCode  = $('#project-code');
		$startDate = $('#startDateLo');
		$endDate = $('#startDateHi');

		spyOn(PORTAL.VIEWS, 'createCodeSelect');
		spyOn(PORTAL.VIEWS, 'createPagedCodeSelect');

		fetchSampleMediaDeferred = $.Deferred();
		fetchCharacteristicTypeDeferred = $.Deferred();

		sampleMediaModel = {
			fetch : jasmine.createSpy('sampleMediaModelFetch').and.returnValue(fetchSampleMediaDeferred)
		};
		characteristicTypeModel = {
			fetch : jasmine.createSpy('characteristicTypeModelFetch').and.returnValue(fetchCharacteristicTypeDeferred)
		};

		testView = PORTAL.VIEWS.samplingParameterInputView({
			$container : $testDiv,
			sampleMediaModel : sampleMediaModel,
			characteristicTypeModel : characteristicTypeModel
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that the sampleMedia and characteristicType lookups are fetched during initialize', function() {
		testView.initialize();
		expect(sampleMediaModel.fetch).toHaveBeenCalled();
		expect(characteristicTypeModel.fetch).toHaveBeenCalled();
	});

	it('Expects that characteristic name and project code menus are initialized', function() {
		testView.initialize();
		expect(PORTAL.VIEWS.createPagedCodeSelect).toHaveBeenCalled();
		expect(PORTAL.VIEWS.createPagedCodeSelect.calls.argsFor(0)[0].attr('id')).toEqual($characteristicName.attr('id'));
		expect(PORTAL.VIEWS.createPagedCodeSelect.calls.argsFor(1)[0].attr('id')).toEqual($projectCode.attr('id'));
	});

	it('Expects that the sampleMedia and characteristicType menus are not initialized until the fetch is complete', function() {
		testView.initialize();
		expect(PORTAL.VIEWS.createCodeSelect).not.toHaveBeenCalled();
		fetchSampleMediaDeferred.resolve();
		expect(PORTAL.VIEWS.createCodeSelect).toHaveBeenCalled();
		expect(PORTAL.VIEWS.createCodeSelect.calls.argsFor(0)[0].attr('id')).toEqual($sampleMedia.attr('id'));

		fetchCharacteristicTypeDeferred.resolve();
		expect(PORTAL.VIEWS.createCodeSelect.calls.count()).toBe(2);
		expect(PORTAL.VIEWS.createCodeSelect.calls.argsFor(1)[0].attr('id')).toEqual($characteristicType.attr('id'));
	});

	describe('Tests for promise returned from initialize', function() {
		var initializeSuccessSpy, initializeFailSpy;

		beforeEach(function () {
			initializeSuccessSpy = jasmine.createSpy('initializeSuccessSpy');
			initializeFailSpy = jasmine.createSpy('initializeFailSpy');

			testView.initialize().done(initializeSuccessSpy).fail(initializeFailSpy);
		});

		it('Expects that initialize returned promise is not resolved until both the sample media and characteristic type have been successfully fetched', function () {
			expect(initializeSuccessSpy).not.toHaveBeenCalled();
			expect(initializeFailSpy).not.toHaveBeenCalled();

			fetchSampleMediaDeferred.resolve();
			expect(initializeSuccessSpy).not.toHaveBeenCalled();
			expect(initializeFailSpy).not.toHaveBeenCalled();

			fetchCharacteristicTypeDeferred.resolve();
			expect(initializeSuccessSpy).toHaveBeenCalled();
			expect(initializeFailSpy).not.toHaveBeenCalled();
		});

		it('Expects that initialize returned promise is rejected if sample media is fetched but characteristic types are not successfully fetched', function() {
			fetchSampleMediaDeferred.resolve();
			fetchCharacteristicTypeDeferred.reject();
			expect(initializeSuccessSpy).not.toHaveBeenCalled();
			expect(initializeFailSpy).toHaveBeenCalled();
		});

		it('Expects that initialize returned promise is rejected if characteristic type is fetched but sample media are not successfully fetched', function() {
			fetchSampleMediaDeferred.reject();
			fetchCharacteristicTypeDeferred.reject();
			expect(initializeSuccessSpy).not.toHaveBeenCalled();
			expect(initializeFailSpy).toHaveBeenCalled();
		});
	});

	it('Expects that date fields only allow dates as input, otherwise they are tagged with an error message', function() {
		testView.initialize();
		$startDate.val('AAA').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);
		$startDate.val('01-01-2001').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);

		$endDate.val('BBB').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);
		$endDate.val('01-01-2001').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);
	});

	it('Expects that dates are formatted as MM-DD-YYYY', function() {
		testView.initialize();
		$startDate.val('2001').trigger('change');
		expect($startDate.val()).toEqual('01-01-2001');

		$startDate.val('12-2001').trigger('change');
		expect($startDate.val()).toEqual('12-01-2001');

		$endDate.val('2001').trigger('change');
		expect($endDate.val()).toEqual('12-31-2001');
		$endDate.val('11-2001').trigger('change');
		expect($endDate.val()).toEqual('11-30-2001');
	});
});