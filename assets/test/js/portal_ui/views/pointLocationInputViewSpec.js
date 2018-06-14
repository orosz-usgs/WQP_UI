import PointLocationInputView from '../../../../js/views/pointLocationInputView';


describe('Tests for pointLocationInputView', function() {
    var testView;
    var $testDiv, $within, $lat, $lon;

    beforeEach(function() {
        $('body').append('<div id="test-div">' +
            '<input type="text" id="within" name="within" />' +
            '<input type="text" id="lat" name="lat" />' +
            '<input type="text" id="long" name="long" />' +
            '<div id="useMyLocation"></div>' +
            '</div>');
        $testDiv = $('#test-div');
        $within = $('#within');
        $lat = $('#lat');
        $lon = $('#long');

        testView = new PointLocationInputView({
            $container : $testDiv
        });
    });

    afterEach(function() {
        $('#test-div').remove();
    });

    it('Expects that all text inputs will flag non numeric inputs', function() {
        testView.initialize();

        $within.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);

        $within.val('123').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);

        $lat.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);

        $lat.val('123').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);

        $lon.val('abc').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);

        $lon.val('123').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);
    });

    it('Expect the text inputs to be initialized', function() {
        window.location.hash = '#within=20&lat=43:04:05&long=-100:10:20';
        testView.initialize();

        expect($within.val()).toEqual('20');
        expect($lat.val()).toEqual('43:04:05');
        expect($lon.val()).toEqual('-100:10:20');
        window.location.hash = '';
    });

    // Can't seem to mock the navigator object so can't test the geolocation code.
});
