/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global Config */
/* global L */
/* global NLDI */


describe('Tests for NLDI.addOverlays.', function() {
	var fakeServer;
	var map;
	var $testDiv;
	var mapDiv;
	var mockSite;

	beforeEach(function() {
		fakeServer = sinon.fakeServer.create();

		$('body').prepend('<div id="test-div"><div id="map-div"></div></div>');
		$testDiv = $('#test-div');
		mapDiv = 'map-div';
		map = L.map(mapDiv);

		Config.NLDI_SERVICES_ENDPOINT = 'http://fake-nldi.gov/';
		mockSite = {MonitoringLocationIdentifier : 'USGS-400359097101400'};
		Config.site = mockSite;
		Config.localBaseUrl = 'http://fake-base-url.gov/'
		NLDI.addOverlays(map);
	});

	afterEach(function() {
		fakeServer.restore();
		$testDiv.remove();
	});

	describe('Tests for calling NLDI services.', function() {

		it('Expects NLDI to be called the correct number of times.', function() {
			expect(fakeServer.requests.length).toEqual(5);
		});

		it('Expects current site\'s NLDI data to be retrieved.', function() {
			expect(fakeServer.requests[0].url).toEqual("http://fake-nldi.gov/wqp/USGS-400359097101400/");
		});

		it('Expects 10 mile upstream and downstream lines to be grabbed from NLDI.', function() {
			expect(fakeServer.requests[1].url).toEqual("http://fake-nldi.gov/wqp/USGS-400359097101400/navigate/UT?distance=16.1");
			expect(fakeServer.requests[2].url).toEqual("http://fake-nldi.gov/wqp/USGS-400359097101400/navigate/DM?distance=16.1");
		});

		it('Expects 10 mile sites upstream and downstream to be grabbed from NLDI.', function() {
			expect(fakeServer.requests[3].url).toEqual("http://fake-nldi.gov/wqp/USGS-400359097101400/navigate/UT/wqp?distance=16.1");
			expect(fakeServer.requests[4].url).toEqual("http://fake-nldi.gov/wqp/USGS-400359097101400/navigate/DM/wqp?distance=16.1");
		});
	});
});