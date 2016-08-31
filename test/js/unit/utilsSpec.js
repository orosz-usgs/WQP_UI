/* jslint browser: true */
/*global describe */
/* global beforeEach */
/* global afterEach */
/* global it */
/* global expect */
/* global PORTAL */
/* global $ */

describe('Test PORTAl.UTILS package', function () {
	"use strict";

	describe('Test getQueryString', function() {

		var testParamArray = [
			{name : 'P1', value : 'Value1'},
			{name : 'P2', value : 'Value2_1'},
			{name : 'P2', value : 'Value2_2'},
			{name : 'P2', value : 'Value2_3'},
			{name : 'P3', value : 'Value3'},
			{name : 'P4', value : 'Value4_1'},
			{name : 'P4', value : 'Value4_2'}
		];

		it('Expects that if ignoreList and mulitSelectDelimited are not specified that the array is serialized', function() {
			var result = PORTAL.UTILS.getQueryString(testParamArray);
			expect(result).toContain('P1=Value1');
			expect(result).toContain('P2=Value2_1');
			expect(result).toContain('P2=Value2_2');
			expect(result).toContain('P2=Value2_3');
			expect(result).toContain('P3=Value3');
			expect(result).toContain('P4=Value4_1');
			expect(result).toContain('P4=Value4_2');
		});

		it('Expects that if ignoreList contains names that are in the parameters array that the result string does not contain those parameters', function() {
			var result = PORTAL.UTILS.getQueryString(testParamArray, ['P2', 'P3']);
			expect(result).toContain('P1=Value1');
			expect(result).not.toContain('P2=Value2_1');
			expect(result).not.toContain('P2=Value2_2');
			expect(result).not.toContain('P2=Value2_3');
			expect(result).not.toContain('P3=Value3');
			expect(result).toContain('P4=Value4_1');
			expect(result).toContain('P4=Value4_2');
		});

		it('Expects that if multiSelectDelimited is set to true, duplicate param names are serialized into a single param', function() {
			var result = PORTAL.UTILS.getQueryString(testParamArray, [], true);
			expect(result).toContain('P1=Value1');
			expect(result).toContain('P2=Value2_1%3BValue2_2%3BValue2_3');
			expect(result).toContain('P3=Value3');
			expect(result).toContain('P4=Value4_1%3BValue4_2');
		});

		it('Expects that ignoreList is respected when multiSelectDelimited is set to true', function() {
			var result = PORTAL.UTILS.getQueryString(testParamArray, ['P2', 'P3'], true);
			expect(result).toContain('P1=Value1');
			expect(result).not.toContain('P2=Value2_1%3BValue2_2%3BValue2_3');
			expect(result).not.toContain('P3=Value3');
			expect(result).toContain('P4=Value4_1%3BValue4_2');
		});
	});

	describe('Test getQueryParamJson', function() {

		var testArray = [
			{name : 'statecode', value : 'US:55'},
			{name : 'statecode', value : 'US:54'},
			{name : 'siteType', value : 'Well'},
			{name : 'mimeType', value : 'csv'}
		];

		it('Expects that the calling the function produces the currently encoded json object', function() {
			var result = PORTAL.UTILS.getQueryParamJson(testArray);
			expect(result).toEqual({
				statecode : ['US:55', 'US:54'],
				siteType : ['Well'],
				mimeType : ['csv']
			});
		});

	});

	describe('Test toggleShowHideSections', function () {
		beforeEach(function () {
			var buttonHtml = '<button id="show-hide-toggle" title="Show content">' +
				'<img src="img/expand.png" alt="show" /></button>';
			$('body').append('<div id="test-div">' + buttonHtml + '<div id="content-div" style="display:none;">Here\'s the content</div></div>');
		});

		afterEach(function () {
			$('#test-div').remove();
		});

		it('Expects when toggleShowHideSections is called content is hidden', function () {
			var isVisible = PORTAL.UTILS.toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
			expect(isVisible).toBe(true);
			expect($('#show-hide-toggle').attr('title')).toContain('Hide');
			expect($('#show-hide-toggle img').attr('alt')).toEqual('hide');
		});

		it('Expects when toggleShowHideSections is called twice, the content is shown', function () {
			var isVisible = PORTAL.UTILS.toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
			isVisible = PORTAL.UTILS.toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));

			expect(isVisible).toBe(false);
			expect($('#show-hide-toggle').attr('title')).toContain('Show');
			expect($('#show-hide-toggle img').attr('alt')).toEqual('show');
		});
	});
});
