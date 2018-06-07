import PlaceInputView from '../../../../js/views/placeInputView';


describe('Test PORTAL.VIEWS.placeInputView', function () {
    var testView;

    var countryModel, stateModel, countyModel;
    var fetchCountrySpy, fetchStateSpy, fetchCountySpy;
    var $countrySelect, $stateSelect, $countySelect;

    var initializeComplete, initializeSuccessSpy, initializeFailSpy;


    beforeEach(function () {
        var countryHtml = '<select name="countrycode" id="countrycode" multiple></select>';
        var stateHtml = '<select name="statecode" id="statecode" multiple></select>';
        var countyHtml = '<select name="countycode" id="countycode" multiple></select>';

        $('body').append('<div id="test-div"><form>' +
            countryHtml + stateHtml + countyHtml +
            '</form></div>');

        $countrySelect = $('#countrycode');
        $stateSelect = $('#statecode');
        $countySelect = $('#countycode');

        fetchCountrySpy = $.Deferred();
        fetchStateSpy = $.Deferred();
        fetchCountySpy = $.Deferred();

        var getCountryFromState = function(id) {
            return id ? id.split(':')[0] : '';
        };
        var getStateFromCounty = function(id) {
            var ids = id.split(':');
            return ids.length > 1 ? ids[0] + ':' + ids[1] : '';
        };

        countryModel = PORTAL.MODELS.cachedCodes({
            codes : 'countrycode'
        });
        stateModel = PORTAL.MODELS.codesWithKeys({
            codes : 'statecode',
            keyParameter : 'countrycode',
            parseKey : getCountryFromState
        });
        countyModel = PORTAL.MODELS.codesWithKeys({
            codes : 'countycode',
            keyParameter : 'statecode',
            parseKey : getStateFromCounty
        });

        spyOn(countryModel, 'fetch').and.returnValue(fetchCountrySpy);
        spyOn(stateModel, 'fetch').and.returnValue(fetchStateSpy);
        spyOn(countyModel, 'fetch').and.returnValue(fetchCountySpy);

        spyOn(PORTAL.VIEWS, 'createCodeSelect');
        spyOn(PORTAL.VIEWS, 'createCascadedCodeSelect');

        initializeSuccessSpy = jasmine.createSpy('initializeSuccessSpy');
        initializeFailSpy = jasmine.createSpy('initializeFailSpy');

        testView = new PlaceInputView({
            $container : $('#test-div'),
            countryModel : countryModel,
            stateModel : stateModel,
            countyModel : countyModel
        });

        initializeComplete = testView.initialize();
    });

    afterEach(function () {
        $('#test-div').remove();
    });

    it('Expects the countryModel and stateModel to have been fetched but not the countyModel and that the US states are fetched', function() {
        expect(countryModel.fetch).toHaveBeenCalled();
        expect(stateModel.fetch).toHaveBeenCalledWith(['US']);
        expect(countyModel.fetch).not.toHaveBeenCalled();
    });

    it('Expects the state and county select2\'s to be immediately initialized while the country select2 initializes after a successful fetch', function() {
        expect(PORTAL.VIEWS.createCascadedCodeSelect.calls.count()).toBe(2);
        expect(PORTAL.VIEWS.createCodeSelect).not.toHaveBeenCalled();
        fetchCountrySpy.resolve();
        expect(PORTAL.VIEWS.createCodeSelect).toHaveBeenCalled();
    });

    it('Expects that the returned promise is not resolved until both the countries and the US states have been successfully retrieved', function() {
        initializeComplete.done(initializeSuccessSpy).fail(initializeFailSpy);
        expect(initializeSuccessSpy).not.toHaveBeenCalled();
        expect(initializeFailSpy).not.toHaveBeenCalled();

        fetchCountrySpy.resolve();
        expect(initializeSuccessSpy).not.toHaveBeenCalled();
        expect(initializeFailSpy).not.toHaveBeenCalled();

        fetchStateSpy.resolve();
        expect(initializeSuccessSpy).toHaveBeenCalled();
        expect(initializeFailSpy).not.toHaveBeenCalled();
    });

    it('Expects the returned promise to be rejected if countries are fetches successfully but states are not', function() {
        initializeComplete.done(initializeSuccessSpy).fail(initializeFailSpy);

        fetchCountrySpy.resolve();
        fetchStateSpy.reject();
        expect(initializeSuccessSpy).not.toHaveBeenCalled();
        expect(initializeFailSpy).toHaveBeenCalled();
    });

    it('Expects the returned promise to be rejected is states are fetched successfully but not countries', function() {
        initializeComplete.done(initializeSuccessSpy).fail(initializeFailSpy);

        fetchCountrySpy.reject();
        fetchStateSpy.resolve();
        expect(initializeSuccessSpy).not.toHaveBeenCalled();
        expect(initializeFailSpy).toHaveBeenCalled();
    });

    it('Expects that the isMatch function for the country select creation matches the string in the id or the description', function() {
        var isMatch;
        fetchCountrySpy.resolve();
        isMatch = PORTAL.VIEWS.createCodeSelect.calls.argsFor(0)[1].isMatch;
        expect(isMatch('this', {id : 'this1', desc: 'Nothing', provider : 'P1'})).toBe(true);
        expect(isMatch('thing', {id : 'this1', desc: 'Nothing', provider : 'P1'})).toBe(true);
        expect(isMatch('P1', {id : 'this1', desc: 'Nothing', provider : 'P1'})).toBe(false);
    });

    it('Expects that the isMatch function for the state select matches the id, desc, or FIPS code', function() {
        var isMatch;
        isMatch = PORTAL.VIEWS.createCascadedCodeSelect.calls.argsFor(0)[1].isMatch;
        expect(isMatch('02', {id : 'US:02', desc: 'Alaska', provider : 'P1'})).toBe(true);
        expect(isMatch('AK', {id : 'US:02', desc: 'Alaska', provider : 'P1'})).toBe(true);
        expect(isMatch('Ala', {id : 'US:02', desc: 'Alaska', provider : 'P1'})).toBe(true);
        expect(isMatch('P1', {id : 'US:02', desc: 'Alaska', provider : 'P1'})).toBe(false);
    });

    it('Expects that the isMatch function for the county select matches the description', function() {
        var isMatch;
        isMatch = PORTAL.VIEWS.createCascadedCodeSelect.calls.argsFor(1)[1].isMatch;
        expect(isMatch('Dan', {id : 'US:02:02', desc: 'Dane', provider : 'P1'})).toBe(true);
        expect(isMatch('02', {id : 'US:02:02', desc: 'Dane', provider : 'P1'})).toBe(false);
        expect(isMatch('P1', {id : 'US:02:02', desc: 'Dane', provider : 'P1'})).toBe(false);
    });

    it('Expects the country template selection to show the id', function() {
        var templateSelection;
        fetchCountrySpy.resolve();
        templateSelection = PORTAL.VIEWS.createCodeSelect.calls.argsFor(0)[2].templateSelection;
        expect(templateSelection({id : 'US', text : 'USA'})).toEqual('US');
    });

    it('Expects the state template to show the id unless the country code is US, then it shows postal code', function() {
        var templateSelection;
        templateSelection = PORTAL.VIEWS.createCascadedCodeSelect.calls.argsFor(0)[2].templateSelection;
        expect(templateSelection({id : 'CN:01', text : 'Alberta'})).toEqual('CN:01');
        expect(templateSelection({id : 'US:02', text : 'Alaska'})).toEqual('US:AK');
    });

    it('Expects the county template to show the id unless it\'s a US county, then it substitutes the state\'s postal code', function() {
        var templateSelection;
        templateSelection = PORTAL.VIEWS.createCascadedCodeSelect.calls.argsFor(1)[2].templateSelection;
        expect(templateSelection({id : 'CN:01:01', text : 'A province'})).toEqual('CN:01:01');
        expect(templateSelection({id : 'US:02:01', text : 'A county'})).toEqual('US:AK:01');
    });

    it('Expects that if the country is remove the state select will no longer contains states from that country', function() {
        $countrySelect.html('<option selected value="US">US</option><option selected value="CN">CN</option>');
        $stateSelect.html('<option selected value="US:01">US:01</option><option selected value="CN:01">CN:01</option>');
        $countrySelect.val(['US']).trigger('change');
        expect($stateSelect.val()).toEqual(['US:01']);
    });

    it('Expects that if a state is removed from the state select, the county select will no longer contain counties from that state', function() {
        $stateSelect.html('<option selected value="US:01">US:01</option><option selected value="US:02">US:02</option>');
        $countySelect.html('<option selected value="US:01:01">US:01:01</option><option selected value="US:02:01">US:02:01</option>');

        $stateSelect.val(['US:02']).trigger('change');
        expect($countySelect.val()).toEqual(['US:02:01']);
    });

    it('Expects that an error will be shown if a user tries to open the county select if no states are selected', function() {
        $countySelect.trigger('select2:opening');
        expect($countySelect.parent().find('.error-message').length).toBe(1);
    });
});
