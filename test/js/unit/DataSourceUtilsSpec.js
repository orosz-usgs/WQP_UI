describe('PORTAL.DataSourceUtils testing', function () {
	var dataSources = ['DS1', 'DS2', 'DS3'];

	describe('test getCountsFromHeader', function () {
		it('Valid counts for all sources', function () {
			var xhr = {
				getResponseHeader: function (key) {
					var headers = {
						'DS1-Site-Count': 10,
						'DS1-Result-Count': 20,
						'DS2-Site-Count': 11,
						'DS2-Result-Count': 21,
						'DS3-Site-Count': 15,
						'DS3-Result-Count': 25,
						'Total-Site-Count': 45,
						'Total-Result-Count': 55
					};
					return headers[key];
				}
			};

			var result = PORTAL.DataSourceUtils.getCountsFromHeader(xhr, dataSources);
			expect(result.DS1.sites).toBe('10');
			expect(result.DS1.results).toBe('20');
			expect(result.DS2.sites).toBe('11');
			expect(result.DS2.results).toBe('21');
			expect(result.DS3.sites).toBe('15');
			expect(result.DS3.results).toBe('25');
			expect(result.total.sites).toBe('45');
			expect(result.total.results).toBe('55');
		});
		it('Missing counts for some sources', function () {
			var xhr = {
				getResponseHeader: function (key) {
					var headers = {
						'DS1-Result-Count': 20,
						'DS2-Site-Count': 11,
						'DS3-Site-Count': 15,
						'DS3-Result-Count': 25,
						'Total-Result-Count': 55
					};
					return headers[key];
				}
			};

			var result = PORTAL.DataSourceUtils.getCountsFromHeader(xhr, dataSources);
			expect(result.DS1.sites).toBe('0');
			expect(result.DS1.results).toBe('20');
			expect(result.DS2.sites).toBe('11');
			expect(result.DS2.results).toBe('0');
			expect(result.DS3.sites).toBe('15');
			expect(result.DS3.results).toBe('25');
			expect(result.total.sites).toBe('0');
			expect(result.total.results).toBe('55');
		});

		it('Expect counts greater than 1000 to be formatted with commas', function () {
			var xhr = {
				getResponseHeader: function (key) {
					var headers = {
						'DS1-Result-Count': 11220,
						'DS2-Site-Count': 1000111
					};
					return headers[key];
				}
			};

			var result = PORTAL.DataSourceUtils.getCountsFromHeader(xhr, dataSources);
			expect(result.DS1.results).toBe('11,220');
			expect(result.DS2.sites).toBe('1,000,111');
		});
	});
});		
		
