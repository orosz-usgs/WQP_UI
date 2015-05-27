describe('Tests for PORTAL.MODELS.cachedCodes', function() {
    var testCodesModel;
    var server;
    var successSpy, failedSpy;
    
    var response = '{"codes" : [{"value" : "v1", "desc" : "Text1", "providers" : "P1"},' +
    	'{"value" : "v3", "desc" : "Text3", "providers" :"P1 P2"},' +
    	'{"value" : "v2", "desc" : "", "providers" :"P1"}]}';


    beforeEach(function() {
    	Config = {
    		CODES_ENDPOINT : 'http:fakecodesservice/codes'
    	};
        server = sinon.fakeServer.create();

        testCodesModel = PORTAL.MODELS.cachedCodes({ codes : 'test' });
        successSpy = jasmine.createSpy("successSpy");
        failedSpy = jasmine.createSpy("failedSpy");
    });

    afterEach(function() {
        server.restore();
    });

    it('Expects ajax to be called the first time processData is called', function() {
        testCodesModel.processData();

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/test');
    });

    it('Expects successful ajax call to resolve promise with processed data', function() {
        testCodesModel.processData().done(successSpy).fail(failedSpy);

        server.requests[0].respond(200, {'Content-Type' : 'text/json'}, response);
        expect(successSpy).toHaveBeenCalledWith([
            {id : 'v1', desc : 'Text1', providers : 'P1'},
            {id : 'v3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v2', desc : 'v2', providers : 'P1'}
        ]);
        expect(failedSpy).not.toHaveBeenCalled();
    });

    it('Expects unsucessful ajax call to show an alert and to be rejected', function() {
        spyOn(window, 'alert');
        testCodesModel.processData().done(successSpy).fail(failedSpy);;

        server.requests[0].respond(500, 'Bad data');

        expect(alert).toHaveBeenCalled();
        expect(successSpy).not.toHaveBeenCalled();
        expect(failedSpy).toHaveBeenCalled();
    });

    it('Expects the second call to processData to use the cached value', function() {
        testCodesModel.processData().done(successSpy);
        server.requests[0].respond(200, {'Content-Type' : 'text/json'}, response);

        testCodesModel.processData().done(successSpy);

        expect(server.requests.length).toBe(1);
        expect(successSpy.calls.length).toBe(2);
        expect(successSpy.mostRecentCall.args[0]).toEqual([
            {id : 'v1', desc : 'Text1', providers : 'P1'},
            {id : 'v3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v2', desc : 'v2', providers : 'P1'}
        ]);
    });

    it('Expects the two calls to processData to only call ajax once even if the second has not returned yet', function() {
        var successSpy2 = jasmine.createSpy('processDataSpy2');

        testCodesModel.processData().done(successSpy);
        testCodesModel.processData().done(successSpy2);
        expect(server.requests.length).toBe(1);

        server.requests[0].respond(200, {'Content-Type' : 'text/json'}, response);
        expect(successSpy).toHaveBeenCalled();
        expect(successSpy2).toHaveBeenCalledWith([
            {id : 'v1', desc : 'Text1', providers : 'P1'},
            {id : 'v3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v2', desc : 'v2', providers : 'P1'}
        ]);
    });
});
describe('Tests for PORTAL.MODELS.cachedCodesWithKeys', function(){
    var testCodesWithKeysModel;
    var server;
    var successSpy;
    var failedSpy;
    
    var RESPONSE = '{"codes" : [{"value" : "v1:T1", "desc" : "Text1", "providers" : "P1"},' +
    	'{"value" : "v1:T3", "desc" : "Text3", "providers" : "P1 P2"},' +
    	'{"value" : "v1:T2", "providers" : "P1"}]}';

    beforeEach(function() {
        server = sinon.fakeServer.create();

        testCodesWithKeysModel = PORTAL.MODELS.cachedCodesWithKeys({
            codes : 'test',
            keyParameter : 'parentParm',
            parseKey : function(id) {
                return id.split(':')[0];
            }
        });
        successSpy = jasmine.createSpy("successSpy");
        failedSpy = jasmine.createSpy('failedSpy');
    });

    afterEach(function() {
        server.restore();
    });

    it('Expects ajax to be called the first time processData is called', function() {
        testCodesWithKeysModel.processData(['v1']);

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/test?parentParm=v1');
    });

    it ('Expects unsuccessful ajax call to show alert window and to reject the promise', function() {
        testCodesWithKeysModel.processData(['v1']).done(successSpy).fail(failedSpy);
        spyOn(window, 'alert');
        server.requests[0].respond(500, 'Bad data');
        expect(alert).toHaveBeenCalled();
        expect(successSpy).not.toHaveBeenCalled();
        expect(failedSpy).toHaveBeenCalled();
    });

    it('Expects successful ajax call to call process function with processed data', function() {
        testCodesWithKeysModel.processData(['v1']).done(successSpy);

        server.requests[0].respond(200, {'Content-Type' : 'text/json'}, RESPONSE);
        expect(successSpy).toHaveBeenCalledWith({v1 :[
            {id : 'v1:T1', desc : 'Text1', providers : 'P1'},
            {id : 'v1:T3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v1:T2', desc : 'v1:T2', providers : 'P1'}]}
        );
    });

    describe('Tests second processData call', function() {
    	
    	var response2 = 
        	'{"codes" : [{"value" : "v2:T4", "desc" : "Text4", "providers" : "P2"},' +
        	'{"value" : "v2:T5", "desc" : "Text5", "providers" : "P1 P2"}]}';

        beforeEach(function() {
            testCodesWithKeysModel.processData(['v1']).done(successSpy);


            server.requests[0].respond(200, {'Content-Type' : 'text/json'}, RESPONSE);
        });

        it('Expects second call with the same key plus a new one to call ajax to retrieve the second key', function() {
            testCodesWithKeysModel.processData(['v1', 'v2']).done(successSpy);

            expect(server.requests.length).toBe(2);
            expect(server.requests[1].url).toContain(Config.CODES_ENDPOINT + '/test?parentParm=v2');
        });

        it('Expects successful second ajax call to call process with v1 and v2 data', function() {
            testCodesWithKeysModel.processData(['v1', 'v2']).done(successSpy);

            server.requests[1].respond(200, {'Content-Type' : 'text/json'}, response2);

            expect(successSpy.calls.length).toBe(2);
            expect(successSpy.mostRecentCall.args[0]).toEqual({
                v1 : [
                    {id : 'v1:T1', desc : 'Text1', providers : 'P1'},
                    {id : 'v1:T3', desc : 'Text3', providers : 'P1 P2'},
                    {id : 'v1:T2', desc : 'v1:T2', providers : 'P1'}
                ],
                v2 : [
                    {id : 'v2:T4', desc : 'Text4', providers : 'P2'},
                    {id : 'v2:T5', desc : 'Text5', providers : 'P1 P2'}
                ]
            });
        });

        it('Expects third call with v1 and v2 keys to not call ajax', function() {
            testCodesWithKeysModel.processData(['v1', 'v2']).done(successSpy);

            server.requests[1].respond(200, {'Content-Type' : 'text/json'}, response2);

            testCodesWithKeysModel.processData(['v1', 'v2']).done(successSpy);
            expect(server.requests.length).toBe(2);
            expect(successSpy.calls.length).toBe(3);
            expect(successSpy.mostRecentCall.args[0]).toEqual({
                v1 : [
                    {id : 'v1:T1', desc : 'Text1', providers : 'P1'},
                    {id : 'v1:T3', desc : 'Text3', providers : 'P1 P2'},
                    {id : 'v1:T2', desc : 'v1:T2', providers : 'P1'}
                ],
                v2 : [
                    {id : 'v2:T4', desc : 'Text4', providers : 'P2'},
                    {id : 'v2:T5', desc : 'Text5', providers : 'P1 P2'}
                ]
            });
        });
        it('Expects third call with v1 and v2 keys to call ajax if a response has not returned but to update the cached data completely', function() {
            var successSpy2 = jasmine.createSpy('successSpy2');

            testCodesWithKeysModel.processData(['v1', 'v2']).done(successSpy);
            testCodesWithKeysModel.processData(['v1', 'v2']).done(successSpy2);;

            expect(server.requests.length).toBe(3);

            server.requests[1].respond(200, {'Content-Type' : 'text/json'}, response2);
            server.requests[2].respond(200, {'Content-Type' : 'text/json'}, response2);
            expect(successSpy.calls.length).toBe(2);
            expect(successSpy2).toHaveBeenCalledWith({
                v1 : [
                    {id : 'v1:T1', desc : 'Text1', providers : 'P1'},
                    {id : 'v1:T3', desc : 'Text3', providers : 'P1 P2'},
                    {id : 'v1:T2', desc : 'v1:T2', providers : 'P1'}
                ],
                v2 : [
                    {id : 'v2:T4', desc : 'Text4', providers : 'P2'},
                    {id : 'v2:T5', desc : 'Text5', providers : 'P1 P2'}
                ]
            });
        });

    });
});