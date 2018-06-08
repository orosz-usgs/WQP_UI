import { CascadedCodeSelect, CodeSelect, PagedCodeSelect, StaticSelect2 } from '../../../../js/views/portalViews';
import { CachedCodes, CodesWithKeys } from '../../../../js/portalModels';
import providers from '../../../../js/providers';


describe('Tests for PORTAL.VIEWS functions and objects', function () {
    describe('Tests for StaticSelect2', function () {

        beforeEach(function () {
            $('body').append('<div id="test-div"><select id="test-select" name="test-select-name" multiple></select></div>');
            spyOn($.fn, 'select2');
        });

        afterEach(function () {
            $('#test-div').remove();
        });

        it('Expects select2 to be called data representing the ids', function () {
            new StaticSelect2($('#test-select'), ['T1', 'T2', 'T3']);
            expect($.fn.select2).toHaveBeenCalled();
            expect($.fn.select2.calls.argsFor(0)[0].data).toEqual([
                {id: 'T1', text: 'T1'}, {id: 'T2', text: 'T2'}, {id: 'T3', text: 'T3'}
            ]);

        });

        it('Expects select2 to be called with the additional options', function () {
            new StaticSelect2($('#test-select'), ['T1', 'T2', 'T3'], {
                placeholder: 'Any'
            });

            expect($.fn.select2.calls.argsFor(0)[0].placeholder).toEqual('Any');
        });
    });

    describe('Tests for new PagedCodeSelect', function () {
        var server;
        var testSpec;
        var testParam, testFilter;

        beforeEach(function () {
            server = sinon.fakeServer.create();
            $('body').append('<div id="test-div">' +
                '<select multiple id="test-select2" />' +
                '<input type="text" id="filtertext" />' +
                '</div>');
            testSpec = {codes: 'codeitems'};
            testParam = 'test';
            testFilter = $('#filtertext');

            spyOn($.fn, 'select2');
        });

        afterEach(function () {
            server.restore();
            Config.CODES_ENDPOINT = '';
            $('#test-div').remove();
        });

        it('Expects select2 to be initialized with defaults properties', function () {
            new PagedCodeSelect($('#test-select2'), testSpec, {});
            expect($.fn.select2).toHaveBeenCalled();

            var options = $.fn.select2.calls.argsFor(0)[0];
            expect(options.allowClear).toEqual(true);
            expect(options.templateSelection).toBeDefined();
            expect(options.ajax).toBeDefined();
        });

        it('Expects select2 defaults to be overriden and additional parameters used to create the select2', function () {
            new PagedCodeSelect($('#test-select2'), testSpec, {placeholder: 'Pick one'});
            var options = $.fn.select2.calls.argsFor(0)[0];
            expect(options.allowClear).toEqual(true);
            expect(options.placeholder).toEqual('Pick one');
        });

        it('Expects the filter parameters will be used when provided', function () {
            new PagedCodeSelect($('#test-select2'), testSpec, {}, testFilter, testParam);
            testFilter.val('param1').trigger('change');
            var ajaxOption = $.fn.select2.calls.argsFor(0)[0].ajax;
            expect(ajaxOption.url).toContain('?test=param1');
            testFilter.val(['param2', 'param3']).trigger('change');
            expect(ajaxOption.url).toContain('?test=param2&test=param3');

        });

        it('Expects the select2\'s ajax parameter to be configured to use the specified codes service', function () {
            new PagedCodeSelect($('#test-select2'), testSpec, {});
            var ajaxOption = $.fn.select2.calls.argsFor(0)[0].ajax;
            expect(ajaxOption.url).toContain(testSpec.codes);
        });

        it('Expects the select2\'s ajax parameter\'s data function to set query params', function () {
            testSpec.pagesize = 15;
            new PagedCodeSelect($('#test-select2'), testSpec, {});
            var dataFnc = $.fn.select2.calls.argsFor(0)[0].ajax.data;
            var params = dataFnc({term: 'ab', page: 2});
            expect(params).toEqual({
                text: 'ab',
                pagesize: 15,
                pagenumber: 2,
                mimeType: 'json'
            });
        });
        it('Expects the select2\'s ajax parameter\'s results function to format the data into a form that select2 can use', function () {
            testSpec.formatData = jasmine.createSpy('formatDataSpy').and.returnValue('formatted data');
            testSpec.pagesize = 15;
            new PagedCodeSelect($('#test-select2'), testSpec, {});
            var resultsFnc = $.fn.select2.calls.argsFor(0)[0].ajax.processResults;

            var DATA = $.parseJSON('{"codes" : [{"value" : "v1", "desc" : "Text1", "providers" : "P1"},' +
                '{"value" : "v3", "desc" : "Text3", "providers" :"P1 P2"},' +
                '{"value" : "v2", "desc" : "", "providers" :"P1"}], "recordCount" : 17}');
            var results = resultsFnc(DATA, {page: 1});
            expect(results.results.length).toBe(3);
            expect(testSpec.formatData.calls.count()).toBe(3);
            expect(testSpec.formatData.calls.argsFor(0)[0]).toEqual({value: 'v1', desc: 'Text1', providers: 'P1'});
            expect(results.results[0]).toEqual({id: 'v1', text: 'formatted data'});
            expect(results.pagination.more).toBe(true);
        });
    });

    describe('Tests for CodeSelect', function () {
        var testModel;
        var testSpec;
        var server;
        var RESPONSE_DATA = '{"codes" : [{"value" : "v1", "desc" : "Text1", "providers" : "P1"},' +
                '{"value" : "v3", "desc" : "Text3", "providers" :"P1 P2"},' +
                '{"value" : "v2", "desc" : "", "providers" :"P1"}], "recordCount" : 3}';

        beforeEach(function () {
            server = sinon.fakeServer.create();
            $('body').append('<div id="test-div">' +
                '<select multiple id="test-select2" />' +
                '</div>');
            testModel = new CachedCodes({codes: 'testCode'});
            testModel.fetch();
            server.requests[0].respond(200, {'Content-Type': 'text/json'}, RESPONSE_DATA);
            testSpec = {model: testModel};

            spyOn($.fn, 'select2');
            spyOn(providers, 'formatAvailableProviders').and.returnValue('P1');
        });

        afterEach(function () {
            server.restore();
            $('#test-div').remove();
        });

        it('Expects that the select2 is not initialized', function () {
            new CodeSelect($('#test-select2'), testSpec);
            expect($.fn.select2).toHaveBeenCalled();
            var options = $.fn.select2.calls.argsFor(0)[0];
            expect(options.allowClear).toBe(true);
            expect(options.matcher).toBeDefined();
            expect(options.templateSelection).toBeDefined();
            expect(options.data.length).toBe(3);
            expect(options.data[0]).toEqual({
                id: 'v1',
                text: 'Text1 (P1)'
            });
        });


        it('Expects select2 options to be merged with defaults', function () {
            var options;

            new CodeSelect($('#test-select2'), testSpec, {
                placeholder: 'Any',
                width: '400px'
            });
            options = $.fn.select2.calls.argsFor(0)[0];
            expect(options.placeholder).toEqual('Any');
        });

        it('Expects default isMatch to search (case insensitive) the desc property', function () {
            var matcher;
            spyOn(testModel, 'getLookup').and.returnValue({id: 'M1', desc: 'Monday', providers: 'P1'});
            new CodeSelect($('#test-select2'), testSpec);
            matcher = $.fn.select2.calls.argsFor(0)[0].matcher;
            expect(matcher({term: 'M1'}, {id: 'M1'})).toBeNull();
            expect(matcher({term: 'mo'}, {id: 'M1'}, 'mo')).toEqual({id: 'M1'});
            expect(matcher('', {id: 'M1'})).toEqual({id: 'M1'});
        });

        it('Expects the default templateSelection function to return the id', function () {
            var templateSelection;

            new CodeSelect($('#test-select2'), testSpec);
            templateSelection = $.fn.select2.calls.argsFor(0)[0].templateSelection;
            expect(templateSelection({id: 'V1', text: 'Verbose 1'})).toEqual('V1');
        });
    });
});

describe('Tests for CascadedCodeSelect', function () {
    var RESPONSE_DATA = '{"codes" : [{"value" : "v1:T1", "desc" : "Text1", "providers" : "P1"},' +
        '{"value" : "v1:T3", "desc" : "Text3", "providers" : "P1 P2"},' +
        '{"value" : "v1:T2", "providers" : "P1"},' +
        '{"value" : "v2:T4", "desc" : "Text4", "providers" : "P2"},' +
        '{"value" : "v2:T5", "desc" : "Text5", "providers" : "P1 P2"}' +
        ']}';
    var testModel;
    var $select;
    var fetchDeferred;
    var testGetKeys;
    var testOptions;

    beforeEach(function () {
        $('body').append('<select multiple id="test-select"></select>');
        $select = $('#test-select');

        fetchDeferred = $.Deferred();
        spyOn(CodesWithKeys.prototype, 'fetch').and.returnValue(fetchDeferred);
        spyOn(CodesWithKeys.prototype, 'getAll').and.returnValue($.parseJSON(RESPONSE_DATA).codes);
        spyOn(CodesWithKeys.prototype, 'getAllKeys').and.returnValue(['v1', 'v2']);
        spyOn(CodesWithKeys.prototype, 'getDataForKey').and.returnValue([{
            value: 'v2:T4',
            desc: 'Text4',
            provider: 'P2'
        }, {
            value: 'v2:T5', desc: 'Text5', providers: 'P1 P2'
        }]);
        testModel = new CodesWithKeys({});
        testGetKeys = function () {
            return ['v2'];
        };
        testOptions = {
            model: testModel,
            getKeys: testGetKeys
        };

        spyOn($.fn, 'select2');
    });

    afterEach(function () {
        $select.remove();
    });

    it('Expects the select2 to be initialize with default options', function () {
        var opts;
        new CascadedCodeSelect($select, testOptions, {});

        expect($.fn.select2).toHaveBeenCalled();
        opts = $.fn.select2.calls.argsFor(0)[0];
        expect(opts.allowClear).toBe(true);
        expect(opts.ajax).toBeDefined();
    });

    it('Expects the select2 to be initialized with any additional options', function () {
        var opts;
        new CascadedCodeSelect($select, testOptions, {placeholder: 'Any'});

        opts = $.fn.select2.calls.argsFor(0)[0];
        expect(opts.placeholder).toEqual('Any');
    });

    //TODO: Think about how to test the transport part

});
