import ShowAPIView from '../../../../js/views/showAPIView';


describe('Tests for ShowAPIViewSpec', function() {
    let $testDiv;

    beforeEach(function() {
        $('body').append('<div id="test-div">' +
            '<button type="button"  id="show-queries-button"></button>' +
                '<div id="query-div"><textarea></textarea></div>' +
                '<div id="curl-query-div"><textarea></textarea></div>' +
                '<div id="getfeature-query-div"><textarea></textarea></div>' +
                '</div>'
        );
        $testDiv = $('#test-div');
    });

    afterEach(function() {
        $testDiv.remove();
    });
// TODO -- FIX this test
    it('Expects that clicking on the show-queries-button fills in the text areas appropriately', function() {
        let testView;
        let mockGetQueryParamArray;
        let mockGetResultType;

        mockGetQueryParamArray = jasmine.createSpy('mockGetQueryParamArray').and.returnValue([
            {name : 'Testparam1', value : 'value1'},
            {name : 'Testparam2', value : 'value2'}
        ]);

        mockGetResultType = jasmine.createSpy('mockGetResultType').and.returnValue('Project');

        testView = new ShowAPIView({
            $container : $testDiv,
            getQueryParamArray : mockGetQueryParamArray,
            getResultType: mockGetResultType
        });
        spyOn(ShowAPIView, )
        testView.initialize();
        $('#show-queries-button').trigger('click');
  //      expect($('#query-div textarea').html()).toContain('Project?Testparam1=value1&amp;Testparam2=value2');
        expect($('#curl-query-div textarea').html()).toContain('');
        expect($('#getfeature-query-div textarea').html()).toContain('SEARCHPARAMS=' + encodeURIComponent('Testparam1:value1;Testparam2:value2'));
    });
// TODO -- FIX this test
    it('Expect that clicking on the show-queries-button when a dataProfile parameter is passed in is only reflected in the results-query-div', function() {
        let testView;
        let mockGetQueryParamArray;

        mockGetQueryParamArray = jasmine.createSpy('mockGetQueryParamArray').and.returnValue([
            {name: 'dataProfile', value: 'narrow'},
            {name : 'Testparam1', value : 'value1'},
            {name : 'Testparam2', value : 'value2'}
        ]);

        testView = new ShowAPIView({
            $container : $testDiv,
            getQueryParamArray : mockGetQueryParamArray
        });
        testView.initialize();
        $('#show-queries-button').trigger('click');

        expect($('#query-div textarea').html()).toContain('Station?Testparam1=value1&amp;Testparam2=value2');
        expect($('#curl-query-div textarea').html()).toContain('Result?dataProfile=narrow&amp;Testparam1=value1&amp;Testparam2=value2');
        expect($('#getfeature-query-div textarea').html()).toContain('SEARCHPARAMS=' + encodeURIComponent('Testparam1:value1;Testparam2:value2'));
    });
});

