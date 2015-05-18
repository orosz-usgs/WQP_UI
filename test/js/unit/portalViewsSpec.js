describe('Tests for PORTAL.VIEWS functions and objects', function() {

	describe('Tests for createStaticSelect2', function() {
	
		beforeEach(function() {
			$('body').append('<div id="test-div"><select id="test-select" name="test-select-name"></select></div>');
			spyOn($.fn, 'select2');
		});
	
		afterEach(function() {
			$('#test-div').remove();
		});
	
		it('Expects select2 to be called with default options and options created', function() {
			var selectChildren;
			
			PORTAL.VIEWS.createStaticSelect2($('#test-select'), ['T1', 'T2', 'T3']);
			expect($.fn.select2).toHaveBeenCalledWith({
				placeholder: 'All',
				allowClear : true
			});
			
			selectChildren = $('#test-select').children('option');
			expect(selectChildren.length).toBe(3);
			expect(selectChildren.index($('option[value="T1"]'))).toBe(0);
			expect(selectChildren.index($('option[value="T2"]'))).toBe(1);
			expect(selectChildren.index($('option[value="T3"]'))).toBe(2);
		});
		
		it('Expects select2 to be called with the additional options', function() {
			PORTAL.VIEWS.createStaticSelect2($('#test-select'), ['T1', 'T2', 'T3'], {
				placeholder: 'Any',
				separators: ';'
			});
			
			expect($.fn.select2).toHaveBeenCalledWith({
				placeholder: 'Any',
				allowClear : true,
				separators: ';'
			});
		});
	});
	
	describe('Tests for PORTAL.VIEWS.createPagedCodeSelect', function() {
		var server;
		var testSpec;
		
		beforeEach(function() {
			server = sinon.fakeServer.create();
			$('body').append('<div id="test-div">' +
				'<input type="hidden" id="test-select2" />' +
				'</div>');
			testSpec = {codes: 'codeitems'};
			
			spyOn($.fn, 'select2');
			Config = {
					CODES_ENDPOINT : 'http:fakecodesservice'
			};
		});
		
		afterEach(function() {
			server.restore();
			$('#test-div').remove();
		});
		
		it('Expects select2 to be initialized with defaults properties', function() {
			PORTAL.VIEWS.createPagedCodeSelect($('#test-div'), testSpec, {});
			expect($.fn.select2).toHaveBeenCalled();
			
			var options = $.fn.select2.calls[0].args[0];
			expect(options.placeholder).toEqual('All');
			expect(options.allowClear).toEqual(true);
			expect(options.multiple).toEqual(true);
			expect(options.separator).toEqual(';');
		});
		
		it('Expects select2 defaults to be overriden and additional parameters used to create the select2', function() {
			PORTAL.VIEWS.createPagedCodeSelect($('#test-div'), testSpec, {placeholder : 'Pick one', closeOnSelect : false});
			var options = $.fn.select2.calls[0].args[0];
			expect(options.placeholder).toEqual('Pick one');
			expect(options.allowClear).toEqual(true);
			expect(options.closeOnSelect).toEqual(false);
		});
		
		it('Expects the select2\'s ajax parameter to be configured to use the specified codes service', function() {
			PORTAL.VIEWS.createPagedCodeSelect($('#test-div'), testSpec, {});
			var ajaxOption = $.fn.select2.calls[0].args[0].ajax;
			expect(ajaxOption.url).toContain(testSpec.codes);
		});
		
		it('Expects the select2\'s ajax parameter\'s data function to set query params', function() {
			testSpec.pagesize = 15;
			PORTAL.VIEWS.createPagedCodeSelect($('#test-div'), testSpec, {});
			var dataFnc = $.fn.select2.calls[0].args[0].ajax.data;
			var params = dataFnc('ab', 2);
			expect(params).toEqual({
				text : 'ab',
				pagesize : 15,
				pagenumber : 2,
				mimeType : 'json'
			});
		});
		it('Expects the select2\'s ajax parameter\'s results function to format the data into a form that select2 can use', function() {
			testSpec.formatData = jasmine.createSpy('formatDataSpy').andReturn('formatted data');
			PORTAL.VIEWS.createPagedCodeSelect($('#test-div'), testSpec, {});
			var resultsFnc = $.fn.select2.calls[0].args[0].ajax.results;
			
			var DATA = $.parseJSON('{"codes" : [{"value" : "v1", "desc" : "Text1", "providers" : "P1"},' +
			'{"value" : "v3", "desc" : "Text3", "providers" :"P1 P2"},' +
			'{"value" : "v2", "desc" : "", "providers" :"P1"}], "recordCount" : 3}');
			var results = resultsFnc(DATA, 1, {});
			expect(results.results.length).toBe(3);
			expect(testSpec.formatData.calls.length).toBe(3);
			expect(testSpec.formatData.calls[0].args[0]).toEqual({value : "v1", desc : "Text1", providers : 'P1'});
			expect(results.results[0]).toEqual({id : 'v1', text : 'formatted data'});
			expect(results.more).toBe(false);
		});
	});
	
	describe('Tests for PORTAL.VIEWS.createCodeSelect', function() {
		var testModel;
		var testSpec;
		var server;
		
		beforeEach(function() {
			server = sinon.fakeServer.create();
			$('body').append('<div id="test-div">' +
				'<input type="hidden" id="test-select2" />' +
				'</div>');
			testModel = PORTAL.MODELS.cachedCodes({codes : 'testCode'});
			spyOn(testModel, 'processData').andCallThrough();
			testSpec = {model : testModel};
			
			spyOn($.fn, 'select2');
		});
		
		afterEach(function() {
			server.restore();
			$('#test-div').remove();
		});
		
		it('Expects select2 defaults to be set', function() {
			var options;
		
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
		
			expect($.fn.select2).toHaveBeenCalled();
			options = $.fn.select2.calls[0].args[0];
			expect(options.placeholder).toEqual('All');
			expect(options.allowClear).toEqual(true);
			expect(options.multiple).toEqual(true);
			expect(options.separator).toEqual(';');
			expect(options.formatSelection).toBeDefined();
			expect(options.query).toBeDefined();
		});
		
		it('Expects select2 options to be merged with defaults', function() {
			var options;
			
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec, {
				separator: ',',
				width: '400px'
			});
			
			options = $.fn.select2.calls[0].args[0];
			expect(options.placeholder).toEqual('All');
			expect(options.separator).toEqual(',');
			expect(options.width).toEqual('400px');
		});
		
		it('Expects default isMatch to search (case insensitive) the desc property', function() {
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
			
			expect(testSpec.isMatch({id : 'M1', desc : 'Monday', providers : 'P1'}, 'M1')).toEqual(false);
			expect(testSpec.isMatch({id : 'M1', desc : 'Monday', providers : 'P1'}, 'mo')).toEqual(true);
			expect(testSpec.isMatch({id : 'M1', desc : 'Monday', providers : 'P1'}, '')).toEqual(true);
		});
		
		it('Expects default formatData to return the appropriate object', function() {
			spyOn(PORTAL.MODELS.providers, 'formatAvailableProviders').andReturn('All');
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);

			expect(testSpec.formatData({id : 'M1', desc : 'Monday', providers : 'P1'})).toEqual({
				id : 'M1',
				text : 'Monday (All)'
			});
		});
	
		it('Expects the default getKeys function to return undefined',function() {
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
		
			expect(testSpec.getKeys()).toBeFalsy();
		});
		
		it('Expects the query function invocation to call getKeys if specified', function() {
			var getKeysSpy = jasmine.createSpy('getKeysSpy').andReturn(['One']);
			var testQuery;
		
			testSpec.getKeys = getKeysSpy;
		
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
		
			testQuery = $.fn.select2.calls[0].args[0].query;
			testQuery();
		
			expect(testModel.processData.calls[0].args[0]).toEqual(['One']);
		});
		
		it('Expects the default formatSelection function to return the id', function(){
			var formatSelection;
			
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
			formatSelection = $.fn.select2.calls[0].args[0].formatSelection;
			expect(formatSelection({id: 'V1', text : 'Verbose 1'})).toEqual('V1');
		});
	});
	
	describe('Tests for PORTAL.VIEWS.createCodeSelect default query function when spec.model.processData returns an array', function() {
		// Set up testModel to return data
		var server;
		var testModel, testSpec;
		var callbackSpy;
		
		beforeEach(function() {
		
			server = sinon.fakeServer.create();
		
			testModel = PORTAL.MODELS.cachedCodes({codes : 'testCode'});
			spyOn(testModel, 'processData').andCallThrough();
			testSpec = {model : testModel};
		
			spyOn($.fn, 'select2');
		
			callbackSpy = jasmine.createSpy('callbackSpy');
			spyOn(PORTAL.MODELS.providers, 'formatAvailableProviders').andReturn('All');
		});
		
		afterEach(function() {
			server.restore();
		});
		
		it('Expects query function to compile the correct results if data is an array', function() {
			var options;
			
			var testData = '{"codes" : [{"value" : "v1:T1", "desc" : "Text1", "providers" : "P1"},' +
				'{"value" : "v1:T3", "desc" : "Text3", "providers" : "P1 P2"},' +
				'{"value" : "v1:T2", "providers" : "P1"}]}';
			
			
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
			options = $.fn.select2.calls[0].args[0];
			options.query({term : '', callback : callbackSpy});
			
			// This gives the model data and calls processData's function.
			server.requests[0].respond(200, {'Content-Type' : 'text/json'}, testData);
			
			expect(callbackSpy).toHaveBeenCalled();
			expect(callbackSpy.calls[0].args[0]).toEqual({
				results : [
				           {id : 'v1:T1', text : 'Text1 (All)'},
				           {id : 'v1:T3', text : 'Text3 (All)'},
				           {id : 'v1:T2', text : 'v1:T2 (All)'}
				]
			});
		});
		
		it('Expects an empty results array passed to options.callbacks when an empty array is processed', function() {
			var options;
			var testData = '{"codes" : []}';
			
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
			options = $.fn.select2.calls[0].args[0];
			options.query({term : '', callback : callbackSpy});
			
			// This gives the model data and calls processData's function.
			server.requests[0].respond(200, {'Content-Type' : 'text/json'}, testData);
			
			expect(callbackSpy).toHaveBeenCalled();
			expect(callbackSpy.calls[0].args[0]).toEqual({results : []});
		});
	
	});
	
	describe('Tests for PORTAL.VIEWS.createCodeSelect default query function when spec.model.processData returns an object whose values are arrays', function() {
		// Set up testModel to return data
		var server;
		var testModel, testSpec;
		var callbackSpy;
		
		beforeEach(function() {
		
			server = sinon.fakeServer.create();
			
			testModel = PORTAL.MODELS.cachedCodesWithKeys({
				codes : 'testCode',
				keyParameter : 'parentParm',
				parseKey : function(id) {
					return id.split(':')[0];
				}
			});
			testSpec = {
					model : testModel,
					getKeys : function() {
						return ['v1', 'v2'];
					}
			};
			
			spyOn($.fn, 'select2');
			
			callbackSpy = jasmine.createSpy('callbackSpy');
			spyOn(PORTAL.MODELS.providers, 'formatAvailableProviders').andReturn('All');
		});
		
		afterEach(function() {
			server.restore();
		});
		
		it('Expects query function to compile the correct results if data is an array', function() {
			var options;
			
			var testData = '{"codes" : [{"value" : "v1:T1", "desc" : "Text1", "providers" : "P1"},' +
			'{"value" : "v1:T3", "desc" : "Text3", "providers" : "P1 P2"},' +
			'{"value" : "v1:T2", "providers" : "P1"},' +
			'{"value" : "v2:T4", "desc" : "Text4", "providers" : "P2"},' +
			'{"value" : "v2:T5", "desc" : "Text5", "providers" : "P1 P2"}]}';
			
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
			options = $.fn.select2.calls[0].args[0];
			options.query({term : '', callback : callbackSpy});
			
			// This gives the model data and calls processData's function.
			server.requests[0].respond(200, {'Content-Type' : 'text/json'}, testData);
			
			expect(callbackSpy).toHaveBeenCalled();
			expect(callbackSpy.calls[0].args[0]).toEqual({
				results : [
				           {id : 'v1:T1', text : 'Text1 (All)'},
				           {id : 'v1:T3', text : 'Text3 (All)'},
				           {id : 'v1:T2', text : 'v1:T2 (All)'},
				           {id : 'v2:T4', text : 'Text4 (All)'},
				           {id : 'v2:T5', text : 'Text5 (All)'}
				           ]
			});
		});
		
		it('Expects an empty results array passed to options.callbacks when an empty array is processed', function() {
			var options;
			var testData = '{"codes" : []}';
		
			PORTAL.VIEWS.createCodeSelect($('#test-select2'), testSpec);
			options = $.fn.select2.calls[0].args[0];
			options.query({term : '', callback : callbackSpy});
		
			// This gives the model data and calls processData's function.
			server.requests[0].respond(200, {'Content-Type' : 'text/json'}, testData);
		
			expect(callbackSpy).toHaveBeenCalled();
			expect(callbackSpy.calls[0].args[0]).toEqual({results : []});
		});
	
	});
});