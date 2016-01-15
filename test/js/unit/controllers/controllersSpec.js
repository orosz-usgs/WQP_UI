/* the version of angular-mocks we are using is incompatible with jasmine 2.0 so disabling the tests until we update angular*/
xdescribe('Unit Test: Controllers', function () {

	describe('srsnames controller', function () {
		var scope, ctrl, $httpBackend, rootScope;

		Config = {
			PUBLIC_SRSNAMES_ENDPOINT: 'http://fakeendpoint.com/names'
		};

		beforeEach(inject(function (_$httpBackend_, $rootScope, $controller) {

			$httpBackend = _$httpBackend_;
			$httpBackend.expectGET(Config.PUBLIC_SRSNAMES_ENDPOINT + '?mimeType=json').respond({
				"maxLastRevDate": "May 2013",
				"pcodes": [{
					"parm_cd": "00004",
					"description": "Stream width, feet",
					"characteristicname": "Instream features, est. stream width",
					"measureunitcode": "ft",
					"resultsamplefraction": "",
					"resulttemperaturebasis": "",
					"resultstatisticalbasis": "aaa",
					"resulttimebasis": "",
					"resultweightbasis": "bbb",
					"resultparticlesizebasis": "ccc",
					"last_rev_dt": "2008-02-21"
				},
					{
						"parm_cd": "00310",
						"description": "Biochemical oxygen demand, water, unfiltered, 5 days at 20 degrees Celsius, milligrams per liter",
						"characteristicname": "Biochemical oxygen demand, standard conditions",
						"measureunitcode": "mg/l",
						"resultsamplefraction": "Total",
						"resulttemperaturebasis": "20 deg C",
						"resultstatisticalbasis": "",
						"resulttimebasis": "5 Day",
						"resultweightbasis": "",
						"resultparticlesizebasis": "",
						"last_rev_dt": "2008-06-23"
					}]
			});

			rootScope = $rootScope;
			scope = $rootScope.$new();
			ctrl = $controller(srsnames, {
				$scope: scope
			});
		}));


		it('data should be undefined', function () {
			expect(scope.data).not.toBeDefined();
		});

		it('should get a last change date from the backend', function () {
			$httpBackend.flush();
			expect(scope.data.length).toBe(2);
		});

		it('should get data rows from the backend', function () {
			$httpBackend.flush();
			expect(scope.maxLastRevDate).toBe('May 2013');
		});

	});

});
