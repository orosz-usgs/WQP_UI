/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAL.VIEWS.siteParameterInputView', function() {
	"use strict";

	var testView;
	var $testDiv;
	var $siteType, $organization, $siteId, $huc;
	var fetchSiteTypeDeferred, fetchOrgDeferred;

	var siteTypeModel, organizationModel;

	beforeEach(function() {
		$('body').append('<div id="test-div">' +
			'<select multiple id="siteType"></select>' +
			'<select multiple id="organization"></select>' +
			'<input type="text" id="siteid" />' +
			'<input type="text" id="huc" />' +
			'</div>'
		);

		$testDiv = $('#test-div');
		$siteType = $('#siteType');
		$organization = $('#organization');
		$siteId = $('#siteid');
		$huc = $('#huc');

		fetchSiteTypeDeferred = $.Deferred();
		fetchOrgDeferred = $.Deferred();

		siteTypeModel = {
			fetch : jasmine.createSpy('siteTypeFetch').and.returnValue(fetchSiteTypeDeferred)
		};
		organizationModel = {
			fetch : jasmine.createSpy('organizationFetch').and.returnValue(fetchOrgDeferred)
		};

		spyOn(PORTAL.VIEWS, 'createCodeSelect');

		testView = PORTAL.VIEWS.siteParameterInputView(({
			$container : $testDiv,
			siteTypeModel : siteTypeModel,
			organizationModel : organizationModel
		}));
	});

	afterEach(function() {
		$testDiv.remove();
	});

	it('Expects that the siteTypeModel and organizationModel data is fetched at initialization', function() {
		expect(siteTypeModel.fetch).not.toHaveBeenCalled();
		expect(organizationModel.fetch).not.toHaveBeenCalled();

		testView.initialize();
		expect(siteTypeModel.fetch).toHaveBeenCalled();
		expect(organizationModel.fetch).toHaveBeenCalled();
	});

	it('Expects that the site select and organization selects are not initialized until their model fetches succeed', function() {
		testView.initialize();
		expect(PORTAL.VIEWS.createCodeSelect).not.toHaveBeenCalled();

		fetchSiteTypeDeferred.resolve();
		expect(PORTAL.VIEWS.createCodeSelect.calls.count()).toBe(1);
		expect(PORTAL.VIEWS.createCodeSelect.calls.argsFor(0)[0].attr('id')).toEqual($siteType.attr('id'));

		fetchOrgDeferred.resolve();
		expect(PORTAL.VIEWS.createCodeSelect.calls.count()).toBe(2);
		expect(PORTAL.VIEWS.createCodeSelect.calls.argsFor(1)[0].attr('id')).toEqual($organization.attr('id'));
	});

	it('Expects that invalid site ids are flagged with an error message', function() {
		testView.initialize();
		$siteId.val('abc').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);

		$siteId.val('USGS-1234').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);
	});

	it('Expects that invalid huc ids are flagged with an error message', function() {
		testView.initialize();
		$huc.val('071').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(1);

		$huc.val('07').trigger('change');
		expect($testDiv.has('.error-message').length).toBe(0);
	});

	it('Expects if valid huc data is entered that it is formatted as semi colon separate values with wild cards where needed', function() {
		testView.initialize();
		$huc.val('07;0801').trigger('change');
		expect($huc.val()).toEqual('07*;0801*');
	});
});