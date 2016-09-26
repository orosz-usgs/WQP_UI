/* jslint browser:true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */
/* global sinon */
/* global Config */
/* global PORTAL */
/* global log */

describe('Tests for PORTAL.MODELS.providers', function () {
	"use strict";
	var server;
	var successSpy, failureSpy;

	var RESPONSE = '{"codes" : [{"value": "Src1"}, {"value" : "Src2"}, {"value" : "Src3"}]}';

	beforeEach(function () {
		server = sinon.fakeServer.create();

		successSpy = jasmine.createSpy('successSpy');
		failureSpy = jasmine.createSpy('failureSpy');
		spyOn(log, 'error');
	});

	afterEach(function () {
		server.restore();
	});

	it('Should return an empty array of ids if initialize has not been called', function () {
		expect(PORTAL.MODELS.providers.getIds()).toEqual([]);
	});

	it('Should call ajax to get data when fetch function is invoked', function () {
		PORTAL.MODELS.providers.fetch();
		expect(server.requests.length).toBe(1);
		expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/providers');
	});

	it('When fetch is called,initialize the ids and call successFnc when a successful ajax call is made', function () {
		PORTAL.MODELS.providers.fetch().done(successSpy).fail(failureSpy);

		server.requests[0].respond(200, {'Content-Type': 'text/json'}, RESPONSE);

		expect(successSpy).toHaveBeenCalled();
		expect(failureSpy).not.toHaveBeenCalled();
		expect(PORTAL.MODELS.providers.getIds()).toEqual(['Src1', 'Src2', 'Src3']);
	});

	it('Should call failureFnc when an unsuccessful fetch is made.', function () {
		PORTAL.MODELS.providers.fetch().done(successSpy).fail(failureSpy);
		server.requests[0].respond(500, 'Bad data');

		expect(failureSpy).toHaveBeenCalledWith('Internal Server Error');
		expect(successSpy).not.toHaveBeenCalled();
		expect(PORTAL.MODELS.providers.getIds()).toEqual([]);
	});

	describe('Tests formatAvailableProviders', function () {

		beforeEach(function () {
			PORTAL.MODELS.providers.fetch();
			server.requests[0].respond(200, {'Content-Type': 'text/json'}, RESPONSE);
		});

		it('Expects "all" to be returned if all available providers are specified', function () {
			expect(PORTAL.MODELS.providers.formatAvailableProviders('Src1 Src2 Src3')).toEqual('all');
		});

		it('Expects a comma separated list of providers returned if only some are specified', function () {
			expect(PORTAL.MODELS.providers.formatAvailableProviders('Src2 Src3')).toEqual('Src2, Src3');
			expect(PORTAL.MODELS.providers.formatAvailableProviders('Src2')).toEqual('Src2');
		});

		it('Expects providers that are not in the initialized to be eliminated', function () {
			expect(PORTAL.MODELS.providers.formatAvailableProviders('Src1 Src2 Src3 Src4')).toEqual('all');
			expect(PORTAL.MODELS.providers.formatAvailableProviders('Src1 Src3 Src4')).toEqual('Src1, Src3');
			expect(PORTAL.MODELS.providers.formatAvailableProviders('Src4')).toEqual('');
		});

	});
});

