/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, log */
/* global sinon */
/* global $ */
/* global PORTAL */

describe('Tests for queryService', function() {
	"use strict";

	describe('Tests for fetchQueryCounts', function() {
		var fakeServer;

		var testQuery = [
			{name : 'statecode', value: 'US:55'},
			{name : 'sitetype', value : 'Well'},
			{name : 'statecode', value : 'US:30'},
			{name : 'mimeType', value : 'csv'},
			{name : 'zip', value : 'yes'},
			{name : 'sorted', value : 'no'}
		];

		var successSpy, errorSpy;
		
		//We expect some of these tests to log error messages, but we don't want them in the test output
		//so before each test we will record the initial logging level, mute logging,
		//and after each teste we wil restore the logging level
		var initialLevel = log.getLevel();
		
		beforeEach(function() {
			fakeServer = sinon.fakeServer.create();

			successSpy = jasmine.createSpy('successSpy');
			errorSpy = jasmine.createSpy('errorSpy');
			log.disableAll();
		});

		afterEach(function() {
			fakeServer.restore();
			log.setLevel(initialLevel);
		});

		it('Expects that the mimeType, zip, and sorted are removed from the json payload and that a POST request is made', function() {
			var requestBody;
			PORTAL.queryServices.fetchQueryCounts('Station', testQuery, ['NWIS', 'STORET']);

			expect(fakeServer.requests.length).toBe(1);
			expect(fakeServer.requests[0].method).toEqual('POST');
			requestBody = $.parseJSON(fakeServer.requests[0].requestBody);
			expect(requestBody.statecode).toContain('US:55');
			expect(requestBody.statecode).toContain('US:30');
			expect(requestBody.sitetype).toEqual(['Well']);
			expect(requestBody.mimeType).not.toBeDefined();
			expect(requestBody.zip).not.toBeDefined();
			expect(requestBody.sorted).not.toBeDefined();
		});

		it('Expects a successful response passes a correctly formatted counts record', function() {
			PORTAL.queryServices.fetchQueryCounts('Result', testQuery, ['NWIS', 'STORET']).done(successSpy).fail(errorSpy);
			fakeServer.respondWith([200, {"Content-Type" : "application/json"},
				'{"NWIS-Site-Count":"492","Total-Site-Count":"492","NWIS-Result-Count":"6641","Total-Result-Count":"6641",' +
				'"NWIS-Activity-Count":"664","Total-Activity-Count":"664",' +
				'"STORET-ActivityMetric-Count": "232", "Total-ActivityMetric-Count" : "232",' +
				'"NWIS-ResultDetectionQuantitationLimit-Count": "45", "Total-ResultDetectionQuantitationLimit-Count": "45"}'
			]);
			fakeServer.respond();

			expect(successSpy).toHaveBeenCalled();
			expect(errorSpy).not.toHaveBeenCalled();
			expect(successSpy.calls.argsFor(0)).toEqual([{
				total : {sites : '492', results : '6,641', activities :'664', activitymetrics: '232',
					resultdetections: '45', projects: '0', projectmonitoringlocationweightings: '0'},
				NWIS : {sites : '492', results : '6,641', activities : '664', activitymetrics: '0',
					resultdetections: '45', projects: '0', projectmonitoringlocationweightings: '0'},
				STORET : {sites : '0', results : '0', activities : '0', activitymetrics: '232', resultdetections: '0',
				    projects: '0', projectmonitoringlocationweightings: '0'},
			}]);
		});

		it('Expects a failed response to reject the promise', function() {

			PORTAL.queryServices.fetchQueryCounts('Result', testQuery, ['NWIS', 'STORET']).done(successSpy).fail(errorSpy);
			fakeServer.respondWith([404, {"Content-Type" : 'text/html'}, 'Not found']);
			fakeServer.respond();

			expect(successSpy).not.toHaveBeenCalled();
			expect(errorSpy).toHaveBeenCalled();

		});
	});
});