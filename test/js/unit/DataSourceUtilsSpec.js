describe('DataSourceUtils testing', function() {
    var dataSources = ['DS1', 'DS2', 'DS3'];
    
    describe('test getCountsFromHeader', function() {
        it('Valid counts for all sources', function() {
            var headerString = 'DS1-Site-Count: 10\nDS1-Result-Count: 20\n' +
                    'DS2-Site-Count: 11\nDS2-Result-Count: 21\n' +
                    'DS3-Site-Count: 15\nDS3-Result-Count: 25\n' +
                    'Total-Site-Count: 45\nTotal-Result-Count: 55'
            var headers = new HTTPHeaders(headerString);
            var result = DataSourceUtils.getCountsFromHeader(headers, dataSources);
            expect(result.DS1.sites).toBe('10');
            expect(result.DS1.results).toBe('20');
            expect(result.DS2.sites).toBe('11');
            expect(result.DS2.results).toBe('21');
            expect(result.DS3.sites).toBe('15');
            expect(result.DS3.results).toBe('25');
            expect(result.total.sites).toBe('45');
            expect(result.total.results).toBe('55');          
        });
        it('Missing counts for some sources', function() {
            var headerString = 'DS1-Result-Count: 20\n' +
                    'DS2-Site-Count: 11\n' +
                    'DS3-Site-Count: 0\nDS3-Result-Count: 25\n' +
                    'Total-Result-Count: 55'
            var headers = new HTTPHeaders(headerString);
            var result = DataSourceUtils.getCountsFromHeader(headers, dataSources);
            expect(result.DS1.sites).toBe('0');
            expect(result.DS1.results).toBe('20');
            expect(result.DS2.sites).toBe('11');
            expect(result.DS2.results).toBe('0');
            expect(result.DS3.sites).toBe('0');
            expect(result.DS3.results).toBe('25');
            expect(result.total.sites).toBe('0');
            expect(result.total.results).toBe('55');            
        });
        
        it('Counts greater than 1000', function() {
            var headerString = 'DS1-Result-Count: 11220\n' +
                    'DS2-Site-Count: 1000111\n';
            var headers = new HTTPHeaders(headerString);
            var result = DataSourceUtils.getCountsFromHeader(headers, dataSources);
            expect(result.DS1.results).toBe('11,220');
            expect(result.DS2.sites).toBe('1,000,111');                 
        });
    });
});


