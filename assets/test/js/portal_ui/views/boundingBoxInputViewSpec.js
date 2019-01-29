import BoundingBoxInputView from '../../../../js/views/boundingBoxInputView';


describe('Tests for BoundingBoxInputView', function() {
    let $testDiv;
    let testView;
    let $north, $south, $east, $west, $bbox;

    beforeEach(function() {
        $('body').append('<div id="test-div">' +
            '<input type="text" id="north" />' +
            '<input type="text" id="south" />' +
            '<input type="text" id="east" />' +
            '<input type="text" id="west" />' +
            '<input type="hidden" name="bBox" />' +
            '</div>'
        );
        $testDiv = $('#test-div');
        $north = $('#north');
        $south = $('#south');
        $east = $('#east');
        $west = $('#west');
        $bbox = $('input[name="bBox"]');

        testView = new BoundingBoxInputView({
            $container : $testDiv
        });
    });

    afterEach(function() {
        $testDiv.remove();
    });

    it('Expects that all text inputs will flag non numeric inputs', function() {
        testView.initialize();

        $north.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);
        $north.val('12').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);

        $south.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);
        $south.val('12').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);

        $west.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);
        $west.val('12').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);

        $east.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);
        $east.val('12').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);
    });

    it('Expect the inputs to be initialized if the hash contains bbox parameter with 4 comma separated values', () => {
        window.location.hash = '#bBox=-101,42,-100,43';
        testView.initialize();

        expect($bbox.val()).toEqual('-101,42,-100,43');
        expect($north.val()).toEqual('43');
        expect($south.val()).toEqual('42');
        expect($west.val()).toEqual('-101');
        expect($east.val()).toEqual('-100');

        window.location.hash = '';
    });

    it('Expect the inputs to not be initialized if the hash contains bbox without 4 comma separated values', () => {
        window.location.hash = '#bBox=-101,42,-100';
        testView.initialize();

        expect($bbox.val()).toEqual('');
        expect($north.val()).toEqual('');
        expect($south.val()).toEqual('');
        expect($west.val()).toEqual('');
        expect($east.val()).toEqual('');

        window.location.hash = '';
    });

    it('Expects the hidden input to be set to the null string unless all text inputs are filled in', function() {
        window.location.hash = '';
        testView.initialize();

        $north.val('12').trigger('change');
        expect($bbox.val()).toEqual('');

        $south.val('13').trigger('change');
        expect($bbox.val()).toEqual('');

        $west.val('14').trigger('change');
        expect($bbox.val()).toEqual('');

        $east.val('15').trigger('change');
        expect($bbox.val()).toEqual('14,13,15,12');

        $west.val('20').trigger('change');
        expect($bbox.val()).toEqual('20,13,15,12');

        $south.val('').trigger('change');
        expect($bbox.val()).toEqual('');
        expect($north.val()).toEqual('12');
        expect($east.val()).toEqual('15');
        expect($west.val()).toEqual('20');
    });

    it('Expects the bbox inputs to be cleared if the hidden input is cleared', () => {
        window.location.hash = '';
        testView.initialize();

        $north.val('12').trigger('change');
        $south.val('13').trigger('change');
        $west.val('15').trigger('change');
        $east.val('14').trigger('change');

        expect($bbox.val()).toEqual('15,13,14,12');

        $bbox.val('').trigger('change');
        expect($bbox.val()).toEqual('');
    });

    it('Expects that the "Bounding Box" fields will blank after "resetContainer" is run', function() {
        window.location.hash = '#bBox=-101,42,-100,43';
        testView.initialize();
        expect($bbox.val()).toEqual('-101,42,-100,43');

        testView.resetContainer();
        expect($north.val()).toEqual('');
        expect($south.val()).toEqual('');
        expect($west.val()).toEqual('');
        expect($east.val()).toEqual('');
    });
});
