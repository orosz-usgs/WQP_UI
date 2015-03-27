describe('Tests for PORTAL.MODELS.providers', function() {
    var server;
    var successSpy, failureSpy;
   
    beforeEach(function() {
    	Config  = {
    		CODES_ENDPOINT: 'http://fakecodesendpoint' 
    	}
        server = sinon.fakeServer.create();
       
        successSpy = jasmine.createSpy('successSpy');
        failureSpy = jasmine.createSpy('failureSpy');
    });
    
    afterEach(function() {
        server.restore();
    });
   
    it('Should return an empty array of ids if initialize has not been called', function() {
        expect(PORTAL.MODELS.providers.getIds()).toEqual([]);
    });
   
    it('Should call ajax to get data when initialize function is invoked', function() {
        PORTAL.MODELS.providers.initialize(successSpy, failureSpy);
        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.CODES_ENDPOINT + '/providers');
    });
   
    it('Should call initialize the ids and call successFnc when a successful ajax call is made', function() {
        PORTAL.MODELS.providers.initialize(successSpy, failureSpy);

        var response = '<providers><provider>Src1</provider><provider>Src2</provider><provider>Src3</provider></providers>';
        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, response);
        
        expect(successSpy).toHaveBeenCalledWith(['Src1', 'Src2', 'Src3']);
        expect(failureSpy).not.toHaveBeenCalled();
        expect(PORTAL.MODELS.providers.getIds()).toEqual(['Src1', 'Src2', 'Src3']);
    });
    
    it('Should call failureFnc when an unsuccessful call is made.', function() {
        PORTAL.MODELS.providers.initialize(successSpy, failureSpy);
        server.requests[0].respond(500, 'Bad data');
        
        expect(failureSpy).toHaveBeenCalledWith('Internal Server Error');
        expect(successSpy).not.toHaveBeenCalled();
        expect(PORTAL.MODELS.providers.getIds()).toEqual([]);
    });
    
    describe('Tests formatAvailableProviders', function() {
        
        beforeEach(function() {
            PORTAL.MODELS.providers.initialize(successSpy, failureSpy);
            var response = '<providers><provider>Src1</provider><provider>Src2</provider><provider>Src3</provider></providers>';
            server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, response);
        });
        
        it('Expects "all" to be returned if all available providers are specified', function() {
            expect(PORTAL.MODELS.providers.formatAvailableProviders('Src1 Src2 Src3')).toEqual('all');
        });
        
        it('Expects a comma separated list of providers returned if only some are specified', function() {
            expect(PORTAL.MODELS.providers.formatAvailableProviders('Src2 Src3')).toEqual('Src2, Src3');
            expect(PORTAL.MODELS.providers.formatAvailableProviders('Src2')).toEqual('Src2');
        });
        
        it('Expects providers that are not in the initialized to be eliminated', function() {
            expect(PORTAL.MODELS.providers.formatAvailableProviders('Src1 Src2 Src3 Src4')).toEqual('all');
            expect(PORTAL.MODELS.providers.formatAvailableProviders('Src1 Src3 Src4')).toEqual('Src1, Src3');
            expect(PORTAL.MODELS.providers.formatAvailableProviders('Src4')).toBeNull();
        });
        
    });
});

