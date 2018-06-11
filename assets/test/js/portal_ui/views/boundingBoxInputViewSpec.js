import BoundingBoxInputView from '../../../../js/views/boundingBoxInputView';


describe('Tests for BoundingBoxInputView', function() {
    var $testDiv;
    var testView;
    var $north, $south, $east, $west, $bbox;

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

    it('Expects the hidden input to be set to the null string unless all text inputs are filled in', function() {
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
    });
});
