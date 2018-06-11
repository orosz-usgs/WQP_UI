import { getQueryString, toggleShowHideSections, getQueryParamJson, getAnchorQueryValues } from '../../../js/utils';


describe('Test PORTAl.UTILS package', function () {
    describe('Test getQueryString', function() {

        var testParamArray = [
            {name : 'P1', value : 'Value1'},
            {name : 'P2', value : ['Value2_1', 'Value2_2', 'Value2_3']},
            {name : 'P3', value : 'Value3'},
            {name : 'P4', value : ['Value4_1', 'Value4_2']}
        ];

        it('Expects that if ignoreList and mulitSelectDelimited are not specified that the array is serialized', function() {
            var result = getQueryString(testParamArray);
            expect(result).toContain('P1=Value1');
            expect(result).toContain('P2=Value2_1');
            expect(result).toContain('P2=Value2_2');
            expect(result).toContain('P2=Value2_3');
            expect(result).toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1');
            expect(result).toContain('P4=Value4_2');
        });

        it('Expects that if ignoreList contains names that are in the parameters array that the result string does not contain those parameters', function() {
            var result = getQueryString(testParamArray, ['P2', 'P3']);
            expect(result).toContain('P1=Value1');
            expect(result).not.toContain('P2=Value2_1');
            expect(result).not.toContain('P2=Value2_2');
            expect(result).not.toContain('P2=Value2_3');
            expect(result).not.toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1');
            expect(result).toContain('P4=Value4_2');
        });

        it('Expects that if multiSelectDelimited is set to true, duplicate param names are serialized into a single param', function() {
            var result = getQueryString(testParamArray, [], true);
            expect(result).toContain('P1=Value1');
            expect(result).toContain('P2=Value2_1%3BValue2_2%3BValue2_3');
            expect(result).toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1%3BValue4_2');
        });

        it('Expects that ignoreList is respected when multiSelectDelimited is set to true', function() {
            var result = getQueryString(testParamArray, ['P2', 'P3'], true);
            expect(result).toContain('P1=Value1');
            expect(result).not.toContain('P2=Value2_1%3BValue2_2%3BValue2_3');
            expect(result).not.toContain('P3=Value3');
            expect(result).toContain('P4=Value4_1%3BValue4_2');
        });
    });

    describe('Test getQueryParamJson', function() {

        var testArray = [
            {name : 'statecode', value : ['US:55', 'US:54'], multiple: false},
            {name : 'huc', value: '0701*;0702*', multiple: true},
            {name : 'siteType', value : 'Well', multiple: true},
            {name : 'mimeType', value : 'csv', multiple: false}
        ];

        it('Expects that the calling the function produces the currently encoded json object', function() {
            var result = getQueryParamJson(testArray);

            expect(result.statecode).toEqual(['US:55', 'US:54']);
            expect(result.siteType).toEqual(['Well']);
            expect(result.mimeType).toEqual('csv');
            expect(result.huc).toEqual(['0701*', '0702*']);
        });

    });

    describe('Test toggleShowHideSections', function () {
        beforeEach(function () {
            var buttonHtml = '<button id="show-hide-toggle" title="Show content">' +
                '<img src="img/expand.png" alt="show" /></button>';
            $('body').append('<div id="test-div">' + buttonHtml + '<div id="content-div" style="display:none;">Here\'s the content</div></div>');
        });

        afterEach(function () {
            $('#test-div').remove();
        });

        it('Expects when toggleShowHideSections is called content is hidden', function () {
            var isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
            expect(isVisible).toBe(true);
            expect($('#show-hide-toggle').attr('title')).toContain('Hide');
            expect($('#show-hide-toggle img').attr('alt')).toEqual('hide');
        });

        it('Expects when toggleShowHideSections is called twice, the content is shown', function () {
            var isVisible = toggleShowHideSections($('#show-hide-toggle'), $('#content-div'));
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

        it('Return the parameter when name is in the anchor part of the URL', () => {
            window.location.hash = '#name3=val3&name2=val1&name3=val2';

           expect(getAnchorQueryValues('name2')).toEqual(['val1']);
           expect(getAnchorQueryValues('name3')).toEqual(['val3', 'val2']);
        });
    });
});
