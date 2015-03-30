describe('Tests for siteIdController.retrieveSiteIdInfo', function() {
    var updateSpy;
    var successSpy;
    var server;
    var data = '<WQX>' +
            '<Organization><OrganizationDescription><OrganizationIdentifier>Org1</OrganizationIdentifier>' +
            '<OrganizationFormalName>Organization 1</OrganizationFormalName></OrganizationDescription>' +
            '<MonitoringLocation>' +
            '<MonitoringLocationIdentity><MonitoringLocationIdentifier>Site-1234</MonitoringLocationIdentifier><MonitoringLocationName>Site by river</MonitoringLocationName><MonitoringLocationTypeName>Well</MonitoringLocationTypeName><HUCEightDigitCode>07070002</HUCEightDigitCode>' +
            '</MonitoringLocationIdentity></MonitoringLocation></Organization>' +
            '<Organization><OrganizationDescription><OrganizationIdentifier>Org2</OrganizationIdentifier>' +
            '<OrganizationFormalName>Organization 2</OrganizationFormalName></OrganizationDescription>' +
            '<MonitoringLocation>' +
            '<MonitoringLocationIdentity><MonitoringLocationIdentifier>Site-ABCD</MonitoringLocationIdentifier><MonitoringLocationName>Site by lake</MonitoringLocationName><MonitoringLocationTypeName>Lake</MonitoringLocationTypeName><HUCEightDigitCode>07070001</HUCEightDigitCode>' +
            '</MonitoringLocationIdentity></MonitoringLocation></Organization>' +
            '</WQX>';


    beforeEach(function() {
    	Config = {
    		QUERY_URLS : {
    			Station: 'http://fakestationendpoint'
    		}
    	}
        server = sinon.fakeServer.create();
        updateSpy = jasmine.createSpy('updateSpy');
        successSpy = jasmine.createSpy('successSpy');
    });

    afterEach(function() {
        server.restore();
    });

    it('Expects info message and no ajax call is the length of siteIds is zero', function() {
        PORTAL.CONTROLLER.retrieveSiteIdInfo([], updateSpy, successSpy);
        expect(server.requests.length).toBe(0);
        expect(updateSpy.calls[0].args[0]).toContain('No sites');
    });

    it('Expects ajax to be called if siteIds is not empty and an information message displayed', function() {
        PORTAL.CONTROLLER.retrieveSiteIdInfo(['S1', 'S2'], updateSpy, successSpy);

        expect(server.requests.length).toBe(1);
        expect(server.requests[0].url).toContain(Config.QUERY_URLS.Station);
        expect(server.requests[0].url).toContain('siteid=' + encodeURIComponent('S1;S2'));
        expect(updateSpy.calls[0].args[0]).toEqual('Retrieving site ID data');
    });

    it('Expects successful ajax call and payload to fill in table html in updateSpy', function() {
        var html;
        PORTAL.CONTROLLER.retrieveSiteIdInfo(['S1', 'S2'], updateSpy, successSpy);
        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, data);
        expect(updateSpy.calls.length).toBe(2);
        html = updateSpy.calls[1].args[0];
        expect((html.match(/table/g)).length).toBe(4);

        expect(successSpy).toHaveBeenCalled();
    });
    it('Expects successful ajax call and payload with more than 50 sites to include a message indicating more than 50 sites where selected', function() {
        var siteIds = [];
        var i;
        for (i = 0; i < 51; i++) {
            siteIds.push('S' + i);
        }
        PORTAL.CONTROLLER.retrieveSiteIdInfo(siteIds, updateSpy, successSpy);
        server.requests[0].respond(200, {'Content-Type' : 'text/xml'}, data);
        expect(updateSpy.calls[1].args[0]).toContain('Retrieved 51');
    });
    it('Expects unsuccessful ajax call to display an appropriate message', function() {
        PORTAL.CONTROLLER.retrieveSiteIdInfo(['S1','S2'], updateSpy, successSpy);
        server.requests[0].respond(500, 'Bad data');

        expect(updateSpy.calls[1].args[0]).toContain('Unable to retrieve site information');
        expect(successSpy).not.toHaveBeenCalled();
    });
    it('Expects retrieval to urlencode site ID text ', function() {
        PORTAL.CONTROLLER.retrieveSiteIdInfo(['S1', 'S&2'], updateSpy, successSpy);
        expect(server.requests[0].url).toContain('siteid=' + encodeURIComponent('S1;S&2'));
    });
});