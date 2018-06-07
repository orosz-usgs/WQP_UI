import NldiNavPopupView from '../../../../js/views/nldiNavPopupView';


describe('PORTAL.VIEWS.nldiNavViewPopupView', function() {
    var $testDiv;
    var testMap;
    var navHandlerSpy;

    beforeEach(function() {
        $('body').append('<div id=test-div style="height: 30px; width: 30px;"></div>');
        $testDiv = $('#test-div');
        testMap = L.map('test-div', {
            center: [43.0, -100.0],
            zoom: 4
        });

        navHandlerSpy = jasmine.createSpy('navHandlerSpy');
        new NldiNavPopupView(testMap, {}, L.latLng(43.0, -100.0), navHandlerSpy);
    });

    afterEach(function() {
        $testDiv.remove();
    });

    it('Expects that when updating the navigation type, the nldiModel is updated and the Navigate button is enabled', function() {
        var $select = $('.navigation-selection-div select');
        var $button = $('.navigation-selection-div button');

        expect($select.val()).toEqual('');
        expect($button.prop('disabled')).toBe(true);

        $select.val('UM').trigger('change');

        expect(PORTAL.MODELS.nldiModel.getData().navigation.id).toEqual('UM');
        expect($button.prop('disabled')).toBe(false);
    });

    it('Expects that when updating the distance, the nldModel is updated', function() {
        var $distance = $('.navigation-selection-div input[type="text"]');
        $distance.val('100').trigger('change');

        expect(PORTAL.MODELS.nldiModel.getData().distance).toEqual('100');
    });

    it('Expects that clicking the button causes the navHandler to be executed', function() {
        expect(navHandlerSpy).not.toHaveBeenCalled();

        $('.navigation-selection-div button').trigger('click');
        expect(navHandlerSpy).toHaveBeenCalled();
    });
});
