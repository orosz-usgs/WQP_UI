import log from 'loglevel';

import { CachedCodes, CodesWithKeys } from '../../../js/portalModels';


describe('Tests for CachedCodes', function () {
    var testCodesModel;
    var server;
    var successSpy, failedSpy;

    var response = '{"codes" : [{"value" : "v1", "desc" : "Text1", "providers" : "P1"},' +
        '{"value" : "v3", "desc" : "Text3", "providers" :"P1 P2"},' +
        '{"value" : "v2", "desc" : "", "providers" :"P1"}]}';


    beforeEach(function () {
        server = sinon.fakeServer.create();

        testCodesModel = new CachedCodes({codes: 'test'});
        successSpy = jasmine.createSpy('successSpy');
        failedSpy = jasmine.createSpy('failedSpy');
    });

    afterEach(function () {
        Config.CODES_ENDPOINT = '';
        server.restore();
    });

    it('Expects ajax to be called the first time processData is called', function () {
        testCodesModel.fetch();

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/test');
    });

    it('Expects successful ajax call to resolve promise with processed data', function () {
        testCodesModel.fetch().done(successSpy).fail(failedSpy);

        server.requests[0].respond(200, {'Content-Type': 'text/json'}, response);
        expect(successSpy).toHaveBeenCalledWith([
            {id: 'v1', desc: 'Text1', providers: 'P1'},
            {id: 'v3', desc: 'Text3', providers: 'P1 P2'},
            {id: 'v2', desc: 'v2', providers: 'P1'}
        ]);
        expect(failedSpy).not.toHaveBeenCalled();
    });

    it('Expects unsucessful ajax call to show an error message and to be rejected', function () {
        spyOn(log, 'error');
        testCodesModel.fetch().done(successSpy).fail(failedSpy);

        server.requests[0].respond(500, {}, 'Bad data');

        expect(log.error).toHaveBeenCalled();
        expect(successSpy).not.toHaveBeenCalled();
        expect(failedSpy).toHaveBeenCalled();
    });

    it('Expects getAll to return empty array and getLookup to return undefined before the fetch succeeds', function () {
        testCodesModel.fetch();
        expect(testCodesModel.getAll()).toEqual([]);
        expect(testCodesModel.getLookup('v1')).toBeUndefined();
    });

    it('Expects getAll and getLookup to return expected data once fetch succeeds', function () {
        testCodesModel.fetch();
        server.requests[0].respond(200, {'Content-Type': 'text/json'}, response);
        expect(testCodesModel.getAll()).toEqual([
            {id: 'v1', desc: 'Text1', providers: 'P1'},
            {id: 'v3', desc: 'Text3', providers: 'P1 P2'},
            {id: 'v2', desc: 'v2', providers: 'P1'}
        ]);
        expect(testCodesModel.getLookup('v1')).toEqual({id: 'v1', desc: 'Text1', providers: 'P1'});
    });
});
describe('Tests for CodesWithKeys', function () {
    var testCodesWithKeysModel;
    var server;
    var successSpy;
    var failedSpy;

    var RESPONSE = '{"codes" : [{"value" : "v1:T1", "desc" : "Text1", "providers" : "P1"},' +
        '{"value" : "v1:T3", "desc" : "Text3", "providers" : "P1 P2"},' +
        '{"value" : "v1:T2", "providers" : "P1"},' +
        '{"value" : "v2:T4", "desc" : "Text4", "providers" : "P2"},' +
        '{"value" : "v2:T5", "desc" : "Text5", "providers" : "P1 P2"}' +
        ']}';

    beforeEach(function () {
        server = sinon.fakeServer.create();

        testCodesWithKeysModel = new CodesWithKeys({
            codes: 'test',
            keyParameter: 'parentParm',
            parseKey: function (id) {
                return id.split(':')[0];
            }
        });
        successSpy = jasmine.createSpy('successSpy');
        failedSpy = jasmine.createSpy('failedSpy');
    });

    afterEach(function () {
        server.restore();
    });

    it('Expects ajax to be called the first time processData is called', function () {
        testCodesWithKeysModel.fetch(['v1', 'v2']);

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/test?parentParm=v1;v2');
    });

    it('Expects unsuccessful ajax call to log an error message and to reject the promise', function () {
        testCodesWithKeysModel.fetch(['v1', 'v2']).done(successSpy).fail(failedSpy);
        spyOn(log, 'error');
        server.requests[0].respond(500, {}, 'Bad data');
        expect(log.error).toHaveBeenCalled();
        expect(successSpy).not.toHaveBeenCalled();
        expect(failedSpy).toHaveBeenCalled();
    });

    it('Expects successful ajax call to call process function with processed data', function () {
        testCodesWithKeysModel.fetch(['v1', 'v2']).done(successSpy);

        server.requests[0].respond(200, {'Content-Type': 'text/json'}, RESPONSE);
        expect(successSpy).toHaveBeenCalledWith([
            {id: 'v1:T1', desc: 'Text1', providers: 'P1'},
            {id: 'v1:T3', desc: 'Text3', providers: 'P1 P2'},
            {id: 'v1:T2', desc: 'v1:T2', providers: 'P1'},
            {id: 'v2:T4', desc: 'Text4', providers: 'P2'},
            {id: 'v2:T5', desc: 'Text5', providers: 'P1 P2'}
        ]);
    });

    it('Expects getall and getAllKeys to return empty arrays and getDataForKey to be undefined before fetch succeeds', function () {
        testCodesWithKeysModel.fetch(['v1', 'v2']);
        expect(testCodesWithKeysModel.getAll()).toEqual([]);
        expect(testCodesWithKeysModel.getAllKeys()).toEqual([]);
        expect(testCodesWithKeysModel.getDataForKey('v2')).toBeUndefined();
    });
});
