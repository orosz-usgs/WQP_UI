import log from 'loglevel';

import queryService from '../../../js/queryService';
import { Cookie } from '../../../js/utils';



describe('Tests for queryService', function() {
    describe('Tests for queryService.fetchQueryCounts', function() {
        var fakeServer;

        var testQuery = [
            {name: 'statecode', value: ['US:55', 'US:30'], multiple: false},
            {name: 'sitetype', value: 'Well', multiple: true},
            {name: 'huc', value: '07*;08*', multiple: true},
            {name: 'pcode', value: '123', multiple: false},
            {name: 'mimeType', value: 'csv', multiple: false},
            {name: 'zip', value: 'yes', multiple: false},
            {name: 'sorted', value: 'no', multiple: false}
        ];

        var successSpy, errorSpy;

        //We expect some of these tests to log error messages, but we don't want them in the test output
        //so before each test we will record the initial logging level, mute logging,
        //and after each test we will restore the logging level
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
            queryService.fetchQueryCounts('Station', testQuery, ['NWIS', 'STORET']);

            expect(fakeServer.requests.length).toBe(1);
            expect(fakeServer.requests[0].method).toEqual('POST');
            expect(fakeServer.requests[0].requestHeaders.Authorization).not.toBeDefined();
            requestBody = $.parseJSON(fakeServer.requests[0].requestBody);
            expect(requestBody.statecode.length).toBe(2);
            expect(requestBody.statecode).toContain('US:55');
            expect(requestBody.statecode).toContain('US:30');
            expect(requestBody.sitetype).toEqual(['Well']);
            expect(requestBody.huc.length).toBe(2);
            expect(requestBody.huc).toContain('07*');
            expect(requestBody.huc).toContain('08*');
            expect(requestBody.pcode).toEqual('123');
            expect(requestBody.mimeType).not.toBeDefined();
            expect(requestBody.zip).not.toBeDefined();
            expect(requestBody.sorted).not.toBeDefined();
        });

        it('Expects a successful response passes a correctly formatted counts record', function() {
            queryService.fetchQueryCounts('Result', testQuery, ['NWIS', 'STORET']).done(successSpy).fail(errorSpy);
            fakeServer.respondWith([200, {'Content-Type': 'application/json'},
                '{"NWIS-Site-Count":"492","Total-Site-Count":"492","NWIS-Result-Count":"6641","Total-Result-Count":"6641",' +
                '"NWIS-Activity-Count":"664","Total-Activity-Count":"664",' +
                '"STORET-ActivityMetric-Count": "232", "Total-ActivityMetric-Count" : "232",' +
                '"NWIS-ResultDetectionQuantitationLimit-Count": "45", "Total-ResultDetectionQuantitationLimit-Count": "45"}'
            ]);
            fakeServer.respond();

            expect(successSpy).toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();
            expect(successSpy.calls.argsFor(0)).toEqual([{
                total: {
                    sites: '492', results: '6,641', activities: '664', activitymetrics: '232',
                    resultdetections: '45', projects: '0', projectmonitoringlocationweightings: '0',
                    organizations: '0', biologicalHabitatMetrics: '0'
                },
                NWIS: {
                    sites: '492', results: '6,641', activities: '664', activitymetrics: '0',
                    resultdetections: '45', projects: '0', projectmonitoringlocationweightings: '0',
                    organizations: '0', biologicalHabitatMetrics: '0'
                },
                STORET: {
                    sites: '0', results: '0', activities: '0', activitymetrics: '232', resultdetections: '0',
                    projects: '0', projectmonitoringlocationweightings: '0',
                    organizations: '0', biologicalHabitatMetrics: '0'
                }
            }]);
        });

        it('Expects a failed response to reject the promise', function() {

            queryService.fetchQueryCounts('Result', testQuery, ['NWIS', 'STORET']).done(successSpy).fail(errorSpy);
            fakeServer.respondWith([404, {'Content-Type': 'text/html'}, 'Not found']);
            fakeServer.respond();

            expect(successSpy).not.toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalled();
        });

        it('Expects that a authorization header is added if an access_token cookie is present', function() {
            spyOn(Cookie, 'getByName').and.returnValue('dummy_token');
            queryService.fetchQueryCounts('Station', testQuery, ['NWIS', 'STORET']);

            expect(fakeServer.requests[0].requestHeaders.Authorization).toEqual('Bearer dummy_token');
        });
    });
});
