import log from 'loglevel';

import providers from '../../../js/providers';


describe('Tests for providers', function () {
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
        expect(providers.getIds()).toEqual([]);
    });

    it('Should call ajax to get data when fetch function is invoked', function () {
        providers.fetch();
        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/providers');
    });

    it('When fetch is called,initialize the ids and call successFnc when a successful ajax call is made', function () {
        providers.fetch().done(successSpy).fail(failureSpy);

        server.requests[0].respond(200, {'Content-Type': 'text/json'}, RESPONSE);

        expect(successSpy).toHaveBeenCalled();
        expect(failureSpy).not.toHaveBeenCalled();
        expect(providers.getIds()).toEqual(['Src1', 'Src2', 'Src3']);
    });

    it('Should call failureFnc when an unsuccessful fetch is made.', function () {
        providers.fetch().done(successSpy).fail(failureSpy);
        server.requests[0].respond(500, {}, 'Bad data');

        expect(failureSpy).toHaveBeenCalled();
        expect(successSpy).not.toHaveBeenCalled();
        expect(providers.getIds()).toEqual([]);
    });

    describe('Tests formatAvailableProviders', function () {

        beforeEach(function () {
            providers.fetch();
            server.requests[0].respond(200, {'Content-Type': 'text/json'}, RESPONSE);
        });

        it('Expects "all" to be returned if all available providers are specified', function () {
            expect(providers.formatAvailableProviders('Src1 Src2 Src3')).toEqual('all');
        });

        it('Expects a comma separated list of providers returned if only some are specified', function () {
            expect(providers.formatAvailableProviders('Src2 Src3')).toEqual('Src2, Src3');
            expect(providers.formatAvailableProviders('Src2')).toEqual('Src2');
        });

        it('Expects providers that are not in the initialized to be eliminated', function () {
            expect(providers.formatAvailableProviders('Src1 Src2 Src3 Src4')).toEqual('all');
            expect(providers.formatAvailableProviders('Src1 Src3 Src4')).toEqual('Src1, Src3');
            expect(providers.formatAvailableProviders('Src4')).toEqual('');
        });

    });
});

