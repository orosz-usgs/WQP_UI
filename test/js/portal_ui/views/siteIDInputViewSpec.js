/*global describe */
/*global describe, it, beforeEach, afterEach, expect, jasmine, spyOn */
/*global $ */
/*global PORTAL */
/*global Config */

describe('Test PORTAL.VIEWS.siteIDInputView', function () {
	"use strict";
	var testView;

	var siteIDModel;
	var fetchSiteIDSpy;
	var $siteIDSelect;

	var initializeComplete, initializeSuccessSpy, initializeFailSpy;


	beforeEach(function () {
		var siteIDHtml = '<select name="siteid" id="siteid" multiple></select>';

		$('body').append('<div id="test-div"><form>' +
			siteIDHtml + '</form></div>');

		$siteIDSelect = $('#siteid');

		fetchSiteIDSpy = $.Deferred();

		siteIDModel = PORTAL.MODELS.cachedSiteIDs({
			siteids : 'siteid'
		});

		spyOn(siteIDModel, 'fetch').and.returnValue(fetchSiteIDSpy);

		spyOn(PORTAL.VIEWS, 'createSiteIDSelect');
		spyOn(PORTAL.VIEWS, 'createCascadedSiteIDSelect');

		initializeSuccessSpy = jasmine.createSpy('initializeSuccessSpy');
		initializeFailSpy = jasmine.createSpy('initializeFailSpy');

		testView = PORTAL.VIEWS.placeInputView({
			$container : $('#test-div'),
			siteIDModel: siteIDModel
		});

		initializeComplete = testView.initialize();
	});

	afterEach(function () {
		$('#test-div').remove();
	});

	// it('Expects that the isMatch function for the siteid select creation matches the string in the id or the description', function() {
	// 	var isMatch;
	// 	fetchSiteIDSpy.resolve();
	// 	isMatch = PORTAL.VIEWS.createCodeSelect.calls.argsFor(0)[1].isMatch;
	// 	expect(isMatch('this', {id : 'this1', desc: 'Nothing', provider : 'P1'})).toBe(true);
	// 	expect(isMatch('thing', {id : 'this1', desc: 'Nothing', provider : 'P1'})).toBe(true);
	// 	expect(isMatch('P1', {id : 'this1', desc: 'Nothing', provider : 'P1'})).toBe(false);
	// });


});