/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAL.VIEWS.biologicalSamplingInputView', function() {
	"use strict";

	var testView;
	var $testDiv;
	var $assemblage, $taxonomicName;

	var assemblageModel;
	var fetchAssemblageDeferred;

	beforeEach(function() {
		$('body').append('<div id="test-div">' +
			'<select multiple id="assemblage"></select>' +
			'<select multiple id="subject-taxonomic-name"></select>' +
			'</div>'
		);
		$testDiv = $('#test-div');
		$assemblage = $('#assemblage');
		$taxonomicName = $('#subject-taxonomic-name');

		fetchAssemblageDeferred = $.Deferred();
		assemblageModel = {
			fetch : jasmine.createSpy('assemblageModelFetch').and.returnValue(fetchAssemblageDeferred)
		};

		spyOn(PORTAL.VIEWS, 'createPagedCodeSelect');
		spyOn(PORTAL.VIEWS, 'createCodeSelect');

		testView = PORTAL.VIEWS.biologicalSamplingInputView({
			$container: $testDiv,
			assemblageModel : assemblageModel
		});
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that the assemblage model is fetched at initialization', function() {
		testView.initialize();
		expect(assemblageModel.fetch).toHaveBeenCalled();
	});

	it('Expects that the taxonomic select is initialized', function() {
		testView.initialize();
		expect(PORTAL.VIEWS.createPagedCodeSelect).toHaveBeenCalled();
		expect(PORTAL.VIEWS.createPagedCodeSelect.calls.argsFor(0)[0].attr('id')).toEqual($taxonomicName.attr('id'));
	});

	it('Expects that the assemblage select is initialized after the assemblage model is fetched', function() {
		testView.initialize();
		expect(PORTAL.VIEWS.createCodeSelect).not.toHaveBeenCalled();

		fetchAssemblageDeferred.resolve();
		expect(PORTAL.VIEWS.createCodeSelect).toHaveBeenCalled();
		expect(PORTAL.VIEWS.createCodeSelect.calls.argsFor(0)[0].attr('id')).toEqual($assemblage.attr('id'));
	});

	describe('Tests for promise returned from initialize', function() {
		var initializeSuccessSpy, initializeFailSpy;

		beforeEach(function () {
			initializeSuccessSpy = jasmine.createSpy('initializeSuccessSpy');
			initializeFailSpy = jasmine.createSpy('initializeFailSpy');

			testView.initialize().done(initializeSuccessSpy).fail(initializeFailSpy);
		});

		it('Expects that initialize returned promise is not resolved until assemblage have been successfully fetched', function (done) {
			expect(initializeSuccessSpy).not.toHaveBeenCalled();
			expect(initializeFailSpy).not.toHaveBeenCalled();

			fetchAssemblageDeferred.resolve();
			setTimeout(function() {
				expect(initializeSuccessSpy).toHaveBeenCalled();
				expect(initializeFailSpy).not.toHaveBeenCalled();
				done();
			}, 100);
		});

		it('Expects that initialize returned promise is rejected if assemblage is not successfully fetched', function(done) {
			fetchAssemblageDeferred.reject();

			setTimeout(function() {
				expect(initializeSuccessSpy).not.toHaveBeenCalled();
				expect(initializeFailSpy).toHaveBeenCalled();
				done();
			}, 100);
		});
	});
});