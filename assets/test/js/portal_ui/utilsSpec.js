import { getQueryString, toggleShowHideSections, getQueryParamJson, getAnchorQueryValues,
    initializeInput, checkForUseOfDataProfileArray, separateCurlDataFromParams, buildCurlString } from '../../../js/utils';


describe('Test PORTAl.UTILS package', function () {
    describe('Test getQueryString', function() {

        let testParamArray = [
            {name : 'P1', value : 'Value1'},
            {name : 'P2', value : ['Value2_1', 'Value2_2', 'Value2_3']},
            {name : 'P3', value : 'Value3'},
            {name : 'P4', value : ['Value4_1', 'Value4_2']}
        ];

        it('Expects that if ignoreList and mulitSelectDelimited are not specified that the array is serialized', function() {
            let result = getQueryString(testParamArray);
            expect(result).toContain('P1=Value1');
            expect(result).toContain('P2=Value2_1');
            expect(result).toContain('P2=Value2_2');
            expect(result).toContain('P2=Value2_3');
            expect(result).toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1');
            expect(result).toContain('P4=Value4_2');
        });

        it('Expects that if ignoreList contains names that are in the parameters array that the result string does not contain those parameters', function() {
            let result = getQueryString(testParamArray, ['P2', 'P3']);
            expect(result).toContain('P1=Value1');
            expect(result).not.toContain('P2=Value2_1');
            expect(result).not.toContain('P2=Value2_2');
            expect(result).not.toContain('P2=Value2_3');
            expect(result).not.toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1');
            expect(result).toContain('P4=Value4_2');
        });

        it('Expects that if multiSelectDelimited is set to true, duplicate param names are serialized into a single param', function() {
            let result = getQueryString(testParamArray, [], true);
            expect(result).toContain('P1=Value1');
            expect(result).toContain('P2=Value2_1%3BValue2_2%3BValue2_3');
            expect(result).toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1%3BValue4_2');
        });

        it('Expects that ignoreList is respected when multiSelectDelimited is set to true', function() {
            let result = getQueryString(testParamArray, ['P2', 'P3'], true);
            expect(result).toContain('P1=Value1');
            expect(result).not.toContain('P2=Value2_1%3BValue2_2%3BValue2_3');
            expect(result).not.toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1%3BValue4_2');
        });
    });

    describe('Test getQueryParamJson', function() {

        let testArray = [
            {name : 'statecode', value : ['US:55', 'US:54'], multiple: false},
            {name : 'huc', value: '0701*;0702*', multiple: true},
            {name : 'siteType', value : 'Well', multiple: true},
            {name : 'mimeType', value : 'csv', multiple: false}
        ];

        it('Expects that the calling the function produces the currently encoded json object', function() {
            let result = getQueryParamJson(testArray);

            expect(result.statecode).toEqual(['US:55', 'US:54']);
            expect(result.siteType).toEqual(['Well']);
            expect(result.mimeType).toEqual('csv');
            expect(result.huc).toEqual(['0701*', '0702*']);
        });

    });

    describe('Test toggleShowHideSections', function () {
        beforeEach(function () {
            let buttonHtml = '<button id="show-hide-toggle" title="Show content">' +
                '<img src="img/expand.png" alt="show" /></button>';
            $('body').append('<div id="test-div">' + buttonHtml + '<div id="content-div" style="display:none;">Here\'s the content</div></div>');
        });

        afterEach(function () {
            $('#test-div').remove();
        });

        it('Expects when toggleShowHideSections is called content is hidden', function () {
            let isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
            expect(isVisible).toBe(true);
            expect($('#show-hide-toggle').attr('title')).toContain('Hide');
            expect($('#show-hide-toggle img').attr('alt')).toEqual('hide');
        });

        it('Expects when toggleShowHideSections is called twice, the content is shown', function () {
            let isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
            isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));

            expect(isVisible).toBe(false);
            expect($('#show-hide-toggle').attr('title')).toContain('Show');
            expect($('#show-hide-toggle img').attr('alt')).toEqual('show');
        });
    });

    describe('getAnchorQueryValue', () =>  {
        it('Return the empty array if there is no anchor part of the url', () => {
            window.location.hash = '';

            expect(getAnchorQueryValues('name1')).toEqual([]);
        });

        it('Return the empty array if the anchor part does not contain the parameter name', () => {
           window.location.hash = '#name2=val1&name3=val2';

           expect(getAnchorQueryValues('name1')).toEqual([]);
        });

        it('Will decode url encoded parameters', () => {
            window.location.hash = '#name1=this%20and%20that';

            expect(getAnchorQueryValues('name1')).toEqual(['this and that']);
        });

        it('Return the parameter when name is in the anchor part of the URL', () => {
            window.location.hash = '#name3=val3&name2=val1&name3=val2';

           expect(getAnchorQueryValues('name2')).toEqual(['val1']);
           expect(getAnchorQueryValues('name3')).toEqual(['val3', 'val2']);
        });

        it('Return an empty array if parameter value is empty', () => {
            window.location.hash = '#name3=val3&name2=&name3=val2';

            expect(getAnchorQueryValues('name2')).toEqual(['']);
        });

    });

    describe('initializeTextInput', () => {

        let $testInput;
        beforeEach(() => {
            $('body').append('<input type="text" id="test-id" name="testname" />');
            $testInput = $('#test-id');
        });

        afterEach(() => {
            $testInput.remove();
        });

        it('does not set the value if the anchor part does not contain testname', () => {
            window.location.hash = '#name1=val1';
            initializeInput($testInput);

            expect($testInput.val()).toEqual('');
        });

        it('sets the value if the anchor part does contain testname', () => {
            window.location.hash = '#name1=val1&testname=val2';
            initializeInput($testInput);

            expect($testInput.val()).toEqual('val2');
        });
    });

    describe('Test for checkForUseOfDataProfileArray', () => {
        it('will return a boolean value indicating whether or not the Data Profile should be used.', () => {
            expect(checkForUseOfDataProfileArray()['Result']).toEqual(true);
            expect(checkForUseOfDataProfileArray()['Station']).toEqual(false);
        });
    });

    describe('Test for separateCurlDataFromParams', () => {

        let testAllParams = [
            {name : 'statecode', value : ['US:55', 'US:54'], multiple: false},
            {name : 'huc', value: '0701*;0702*', multiple: true},
            {name : 'siteType', value : 'Well', multiple: true},
            {name : 'mimeType', value : 'csv', multiple: false}
        ];
        it('will return an object with two properties, an array of curl data pairs, and an array of query parameters.', () => {
           let result =  separateCurlDataFromParams(testAllParams);

           expect(result.curlParamsArray).toContain({'name':'mimeType','value':'csv','multiple':false});
           expect(result.curlDataArray).toContain({'name':'statecode','value':['US:55','US:54'],'multiple':false},{'name':'huc','value':'0701*;0702*','multiple':true},{'name':'siteType','value':'Well','multiple':true});
        });
    });

    describe('Test for buildCurlString', () => {

        let testResultType = 'Station';
        let testAllParams = {};
        testAllParams.curlParamsArray = [
            {name: 'mimeType', value: 'mimeTypeTestValue'},
            {name: 'zipType', value: 'zipTypeTestValue'},
            {name: 'sorted', value: 'sortedTestValue'}
        ];
        testAllParams.curlDataArray = [
            {name : 'statecode', value : ['US:55', 'US:54'], multiple: false},
            {name : 'huc', value: '0701*;0702*', multiple: true},
            {name : 'siteType', value : 'Well', multiple: true}
        ];

        it('will return a complete curl command as a string.', () => {
            let result = buildCurlString(testResultType, testAllParams);

            expect(result).toContain('"statecode":["US:55,US:54"]');
            expect(result).toContain('mimeType=mimeTypeTestValue&zipType=zipTypeTestValue&sorted=sortedTestValue');
        });
    });
});
