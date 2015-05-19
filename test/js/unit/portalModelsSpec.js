describe('Tests for PORTAL.MODELS.codes', function() {
    var testCodesModel;
    var server;
    var processDataSpy;

    beforeEach(function() {
    	Config = {
    		CODES_ENDPOINT : 'http:fakecodesservice/codes'
    	};
        server = sinon.fakeServer.create();

        testCodesModel = PORTAL.MODELS.codes({ codes : 'test' });
        processDataSpy = jasmine.createSpy("processDataSpy");
    });

    afterEach(function() {
        server.restore();
    });

    it('Expects ajax to be called the first time processData is called', function() {
        testCodesModel.processData(processDataSpy);

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/test');
    });

    it('Expects successful ajax call to call process function with processed data', function() {
        testCodesModel.processData(processDataSpy);

        var xml = '<Codes><Code value="v1" desc="Text1" providers="P1"/>' +
                '<Code value="v3" desc="Text3" providers="P1 P2" />' +
                '<Code value="v2" desc="" providers="P1"/></Codes>';

        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, xml);
        expect(processDataSpy).toHaveBeenCalledWith([
            {id : 'v1', desc : 'Text1', providers : 'P1'},
            {id : 'v3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v2', desc : 'v2', providers : 'P1'}
        ]);
    });

    it('Expects unsucessful ajax call to show an alert and not call processData', function() {
        spyOn(window, 'alert');
        testCodesModel.processData(processDataSpy);

        server.requests[0].respond(500, 'Bad data');

        expect(alert).toHaveBeenCalled();
        expect(processDataSpy).not.toHaveBeenCalled();
    });

    it('Expects the second call to processData to use the cached value', function() {
        testCodesModel.processData(processDataSpy);

        var xml = '<Codes><Code value="v1" desc="Text1" providers="P1"/>' +
                '<Code value="v3" desc="Text3" providers="P1 P2" />' +
                '<Code value="v2" desc="" providers="P1"/></Codes>';

        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, xml);

        testCodesModel.processData(processDataSpy);

        expect(server.requests.length).toBe(1);
        expect(processDataSpy.calls.length).toBe(2);
        expect(processDataSpy.mostRecentCall.args[0]).toEqual([
            {id : 'v1', desc : 'Text1', providers : 'P1'},
            {id : 'v3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v2', desc : 'v2', providers : 'P1'}
        ]);
    });

    it('Expects the two calls to processData to only call ajax once even if the second has not returned yet', function() {
        var processDataSpy2 = jasmine.createSpy('processDataSpy2');
        var xml = '<Codes><Code value="v1" desc="Text1" providers="P1"/>' +
                '<Code value="v3" desc="Text3" providers="P1 P2" />' +
                '<Code value="v2" desc="" providers="P1"/></Codes>';

        testCodesModel.processData(processDataSpy);
        testCodesModel.processData(processDataSpy2);
        expect(server.requests.length).toBe(1);

        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, xml);
        expect(processDataSpy).toHaveBeenCalled();
        expect(processDataSpy2).toHaveBeenCalledWith([
            {id : 'v1', desc : 'Text1', providers : 'P1'},
            {id : 'v3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v2', desc : 'v2', providers : 'P1'}
        ]);
    });
});
describe('Tests for PORTAL.MODELS.codesWithKeys', function(){
    var testCodesWithKeysModel;
    var server;
    var processDataSpy;

    beforeEach(function() {
        server = sinon.fakeServer.create();

        testCodesWithKeysModel = PORTAL.MODELS.codesWithKeys({
            codes : 'test',
            keyParameter : 'parentParm',
            parseKey : function(id) {
                return id.split(':')[0];
            }
        });
        processDataSpy = jasmine.createSpy("processDataSpy");
    });

    afterEach(function() {
        server.restore();
    });

    it('Expects ajax to be called the first time processData is called', function() {
        testCodesWithKeysModel.processData(processDataSpy, ['v1']);

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/test?parentParm=v1');
    });

    it ('Expects unsuccessful ajax call to show alert window and not call processData', function() {
        testCodesWithKeysModel.processData(processDataSpy, ['v1']);
        spyOn(window, 'alert');
        server.requests[0].respond(500, 'Bad data');
        expect(alert).toHaveBeenCalled();
        expect(processDataSpy).not.toHaveBeenCalled();
    });

    it('Expects successful ajax call to call process function with processed data', function() {
        testCodesWithKeysModel.processData(processDataSpy, ['v1']);

        var xml = '<Codes><Code value="v1:T1" desc="Text1" providers="P1"/>' +
                '<Code value="v1:T3" desc="Text3" providers="P1 P2" />' +
                '<Code value="v1:T2" desc="" providers="P1"/></Codes>';

        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, xml);
        expect(processDataSpy).toHaveBeenCalledWith({ v1 : [
            {id : 'v1:T1', desc : 'Text1', providers : 'P1'},
            {id : 'v1:T3', desc : 'Text3', providers : 'P1 P2'},
            {id : 'v1:T2', desc : 'v1:T2', providers : 'P1'}
        ]});
    });

    describe('Tests second processData call', function() {

        beforeEach(function() {
            testCodesWithKeysModel.processData(processDataSpy, ['v1']);

            var xml = '<Codes><Code value="v1:T1" desc="Text1" providers="P1"/>' +
                      '<Code value="v1:T3" desc="Text3" providers="P1 P2" />' +
                      '<Code value="v1:T2" desc="" providers="P1"/></Codes>';

            server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, xml);
        });

        it('Expects second call with the same key plus a new one to call ajax to retrieve the second key', function() {
            testCodesWithKeysModel.processData(processDataSpy, ['v1', 'v2']);

            expect(server.requests.length).toBe(2);
            expect(server.requests[1].url).toContain(Config.CODES_ENDPOINT + '/test?parentParm=v2');
        });

        it('Expects successful second ajax call to call process with v1 and v2 data', function() {
            testCodesWithKeysModel.processData(processDataSpy, ['v1', 'v2']);

            var xml = '<Codes>' +
                      '<Code value="v2:T4" desc="Text4" providers="P2" />' +
                      '<Code value="v2:T5" desc="Text5" providers="P1 P2" />' +
                      '</Codes>';

            server.requests[1].respond(200, {'Content-Type' : 'text/xml'}, xml);

            expect(processDataSpy.calls.length).toBe(2);
            expect(processDataSpy.mostRecentCall.args[0]).toEqual({
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
            testCodesWithKeysModel.processData(processDataSpy, ['v1', 'v2']);

            var xml = '<Codes>' +
                      '<Code value="v2:T4" desc="Text4" providers="P2" />' +
                      '<Code value="v2:T5" desc="Text5" providers="P1 P2" />' +
                      '</Codes>';

            server.requests[1].respond(200, {'Content-Type' : 'text/xml'}, xml);

            testCodesWithKeysModel.processData(processDataSpy, ['v1', 'v2']);
            expect(server.requests.length).toBe(2);
            expect(processDataSpy.calls.length).toBe(3);
            expect(processDataSpy.mostRecentCall.args[0]).toEqual({
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
            var processDataSpy2 = jasmine.createSpy('processDataSpy2');
            var xml = '<Codes>' +
                      '<Code value="v2:T4" desc="Text4" providers="P2" />' +
                      '<Code value="v2:T5" desc="Text5" providers="P1 P2" />' +
                      '</Codes>';

            testCodesWithKeysModel.processData(processDataSpy, ['v1', 'v2']);
            testCodesWithKeysModel.processData(processDataSpy2, ['v1', 'v2']);

            expect(server.requests.length).toBe(3);

            server.requests[1].respond(200, {'Content-Type' : 'text/xml'}, xml);
            server.requests[2].respond(200, {'Content-Type' : 'text/xml'}, xml);
            expect(processDataSpy.calls.length).toBe(2);
            expect(processDataSpy2).toHaveBeenCalledWith({
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