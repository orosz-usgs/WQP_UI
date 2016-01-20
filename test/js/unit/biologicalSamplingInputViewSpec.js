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
});