/* jslint browser: true */

/* global describe, it, expect, beforeEach, spyOn */
/* global L */
/* global $ */

describe('leafletLayers.WQPSitesLayer', function() {
	"use strict";

	describe('Tests for initializing a layer', function() {

		beforeEach(function() {
			spyOn(L.TileLayer.WMS.prototype, 'initialize').and.callThrough();
		});

		it('Expects that the layer created is an extension of L.TileLayer.WMS', function() {
			var queryParamArray = [{name : 'statecode', value : 'US:55'}];
			L.wqpSitesLayer(queryParamArray, {});

			expect(L.TileLayer.WMS.prototype.initialize).toHaveBeenCalled();
		});

		it('Expects that options specified are passed through to the TileLayer.WMS constructor', function() {
			var queryParamArray = [{name : 'statecode', value : 'US:55'}];
			var options = {styles : 'style1'};
			L.wqpSitesLayer(queryParamArray, options);

			expect(L.TileLayer.WMS.prototype.initialize.calls.argsFor(0)[1]).toEqual(options);
		});

		it('Expects that the query parameters specified are transformed to a SEARCHPARAMS query parameter', function() {
			var queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:025'
				}, {
					name: 'countycode',
					value : 'US:55:001'
				}
			];
			var testLayer = L.wqpSitesLayer(queryParamArray, {});

			expect(testLayer.wmsParams.SEARCHPARAMS).toEqual('statecode:US:55;countycode:US:55:025|US:55:001');
		});

		it('Expects that a query param value which contains semicolon separated strings is transformed to pipe delimited', function() {
			var queryParamArray = [
				{
					name: 'huc',
					value: '0701*;0702*'
				}
			];
			var testLayer = L.wqpSitesLayer(queryParamArray, {});

			expect(testLayer.wmsParams.SEARCHPARAMS).toEqual('huc:0701*|0702*');
		});

		it('Expects that mimeType and zip are removed from the parameters encoded in SEARCHPARAMS', function() {
			var queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:025'
				}, {
					name: 'countycode',
					value : 'US:55:001'
				}, {
					name : 'zip',
					value : 'yes'
				}, {
					name: 'mimeType',
					value : 'csv'
				}
			];
			var testLayer = L.wqpSitesLayer(queryParamArray, {});

			expect(testLayer.wmsParams.SEARCHPARAMS).toEqual('statecode:US:55;countycode:US:55:025|US:55:001');
		});
	});

	describe('Test for getQueryParamArray', function() {
		it('Expects getQueryParamArray to return the layer\'s current queryParamArray', function() {
			var queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:025'
				}, {
					name: 'countycode',
					value : 'US:55:001'
				}
			];
			var testLayer = L.wqpSitesLayer(queryParamArray, {});

			expect(testLayer.getQueryParamArray()).toEqual(queryParamArray);

			queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:002'
				}
			];
			testLayer.updateQueryParams(queryParamArray);
			expect(testLayer.getQueryParamArray()).toEqual(queryParamArray);
		});
	});

	describe('Tests for updateQueryParams', function() {

		var testLayer;

		beforeEach(function() {
			var queryParamArray = [{name : 'statecode', value : 'US:50'}];
			testLayer = L.wqpSitesLayer(queryParamArray, {});
		});

		it('Expects that the SEARCHPARAMS will be updated to reflect the new query parameters', function() {
			var queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:025'
				}, {
					name: 'countycode',
					value : 'US:55:001'
				}
			];
			testLayer.updateQueryParams(queryParamArray);

			expect(testLayer.wmsParams.SEARCHPARAMS).toEqual('statecode:US:55;countycode:US:55:025|US:55:001');
		});

		it('Expects that the updateQueryParams will eliminate the zip and mimeType query parameters', function() {
			var queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:025'
				}, {
					name: 'countycode',
					value : 'US:55:001'
				}, {
					name : 'zip',
					value : 'yes'
				}, {
					name: 'mimeType',
					value : 'csv'
				}
			];
			testLayer.updateQueryParams(queryParamArray);

			expect(testLayer.wmsParams.SEARCHPARAMS).toEqual('statecode:US:55;countycode:US:55:025|US:55:001');
		});
	});

	describe('Tests for getLegendGraphicUrl', function() {
		var testLayer;

		beforeEach(function() {
			var queryParamArray = [{name : 'statecode', value : 'US:50'}];
			testLayer = L.wqpSitesLayer(queryParamArray, {styles: 'style1'});
		});

		it('Expects that a call to getLegendGraphicURL after initialization reflects those parameters and styles', function() {
			var url = testLayer.getLegendGraphicURL();

			expect(url).toContain('layer=' + testLayer.wmsParams.layers);
			expect(url).toContain('style=style1');
			expect(url).toContain('SEARCHPARAMS=' + encodeURIComponent('statecode:US:50'));
		});

		it('Expects that a call to getLegendGraphicURL after calling updateQueryParams reflects the new parameters', function() {
			var queryParamArray = [
				{
					name: 'statecode',
					value : 'US:55'
				}, {
					name: 'countycode',
					value : 'US:55:025'
				}, {
					name: 'countycode',
					value : 'US:55:001'
				}
			];
			testLayer.updateQueryParams(queryParamArray);

			expect(testLayer.getLegendGraphicURL()).toContain('SEARCHPARAMS=' + encodeURIComponent('statecode:US:55;countycode:US:55:025|US:55:001'));
		});

		it('Expects that updating the style and updates the style parameter in getLegendGraphicURL', function() {
			testLayer.setParams({
				styles : 'style2'
			});

			expect(testLayer.getLegendGraphicURL()).toContain('style=style2');
		});
	});

	describe('Tests for fetchSitesInBBox', function() {
		var testLayer;

		beforeEach(function() {
			spyOn($, 'ajax');

			var queryParamArray = [{name : 'statecode', value : 'US:50'}];
			testLayer = L.wqpSitesLayer(queryParamArray);
		});

		it('Expects that a GetFeature request is made for the current layer using the bbox parameter to limit the area of the returned responses', function() {
			var url;
			testLayer.fetchSitesInBBox(L.latLngBounds(L.latLng(42, -99), L.latLng(43, -98)));

			expect($.ajax).toHaveBeenCalled();
			url = $.ajax.calls.argsFor(0)[0].url;
			expect(url).toContain('SEARCHPARAMS=' + encodeURIComponent('statecode:US:50'));
			expect(url).toContain('bbox=42,-99,43,-98');
		});
	});

	describe('Tests for getWFSGetFeatureUrl', function() {
		it('Expects that the SEARCHPARAMS query parameter reflects the queryParamArray', function() {
			var queryParamArray = [{name : 'statecode', value : 'US:50'}];
			var url = L.WQPSitesLayer.getWfsGetFeatureUrl(queryParamArray);
			expect(url).toContain('SEARCHPARAMS=' + encodeURIComponent('statecode:US:50'));
		});
	});

	describe('Tests for getSearchParams', function() {
		it('Expects that the returned string represents the correct SEARCHPARAMS query parameters', function() {
			var queryParamArray =[
				{name : 'statecode', value : 'US:50'},
				{name: 'nldiurl', value: 'http://fakenldi.com/service/nldi/nwissite/04050626/navigate/UM/wqp?distance=50'}
			];
			var param = L.WQPSitesLayer.getSearchParams(queryParamArray);
			expect(param).toContain('statecode:US:50');
			expect(param).toContain('nldiurl:http://fakenldi.com/service/nldi/nwissite/04050626/navigate/UM/wqp?distance=50');
		});
	});

});

