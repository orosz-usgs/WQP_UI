import { CodeSelect } from '../../../../js/views/portalViews';


describe('Tests for PORTAL.VIEWS.siteParameterInputView', function() {
    var testView;
    var $testDiv;
    var $siteType, $organization, $siteId, $huc, $minActivities;
    var fetchSiteTypeDeferred, fetchOrgDeferred;

    var siteTypeModel, organizationModel;

    beforeEach(function() {
        $('body').append('<div id="test-div">' +
            '<select multiple id="siteType"></select>' +
            '<select multiple id="organization"></select>' +
            '<select multiple id="siteid"></select>' +
            '<input type="text" id="huc" />' +
            '<input type="text" id="min-activities" />' +
            '</div>'
        );

        $testDiv = $('#test-div');
        $siteType = $('#siteType');
        $organization = $('#organization');
        $siteId = $('#siteid');
        $huc = $('#huc');
        $minActivities = $('#min-activities');

        fetchSiteTypeDeferred = $.Deferred();
        fetchOrgDeferred = $.Deferred();

        siteTypeModel = {
            fetch : jasmine.createSpy('siteTypeFetch').and.returnValue(fetchSiteTypeDeferred)
        };
        organizationModel = {
            fetch : jasmine.createSpy('organizationFetch').and.returnValue(fetchOrgDeferred)
        };

        spyOn($.fn, 'select2').and.callThrough();
        spyOn(CodeSelect.prototype, 'initialize');

        testView = PORTAL.VIEWS.siteParameterInputView({
            $container : $testDiv,
            siteTypeModel : siteTypeModel,
            organizationModel : organizationModel
        });
    });

    afterEach(function() {
        $testDiv.remove();
    });

    it('Expects that the siteTypeModel and organizationModel data is fetched at initialization', function() {
        expect(siteTypeModel.fetch).not.toHaveBeenCalled();
        expect(organizationModel.fetch).not.toHaveBeenCalled();

        testView.initialize();
        expect(siteTypeModel.fetch).toHaveBeenCalled();
        expect(organizationModel.fetch).toHaveBeenCalled();
    });

    it('Expects that the siteid select is initialized', function() {
        testView.initialize();
        expect($.fn.select2).toHaveBeenCalled();
        expect($.fn.select2.calls.mostRecent().object.attr('id')).toEqual($siteId.attr('id'));
    });

    it('Expects that the site select and organization selects are not initialized until their model fetches succeed', function() {
        testView.initialize();
        expect(CodeSelect.prototype.initialize).not.toHaveBeenCalled();

        fetchSiteTypeDeferred.resolve();
        expect(CodeSelect.prototype.initialize.calls.count()).toBe(1);
        expect(CodeSelect.prototype.initialize.calls.argsFor(0)[0].attr('id')).toEqual($siteType.attr('id'));

        fetchOrgDeferred.resolve();
        expect(CodeSelect.prototype.initialize.calls.count()).toBe(2);
        expect(CodeSelect.prototype.initialize.calls.argsFor(1)[0].attr('id')).toEqual($organization.attr('id'));
    });

    describe('Tests for promise returned from initialize', function() {
        var initializeSuccessSpy, initializeFailSpy;

        beforeEach(function () {
            initializeSuccessSpy = jasmine.createSpy('initializeSuccessSpy');
            initializeFailSpy = jasmine.createSpy('initializeFailSpy');

            testView.initialize().done(initializeSuccessSpy).fail(initializeFailSpy);
        });

        it('Expects that initialize returned promise is not resolved until both the siteType and organizations have been successfully fetched', function () {
            expect(initializeSuccessSpy).not.toHaveBeenCalled();
            expect(initializeFailSpy).not.toHaveBeenCalled();

            fetchSiteTypeDeferred.resolve();
            expect(initializeSuccessSpy).not.toHaveBeenCalled();
            expect(initializeFailSpy).not.toHaveBeenCalled();

            fetchOrgDeferred.resolve();
            expect(initializeSuccessSpy).toHaveBeenCalled();
            expect(initializeFailSpy).not.toHaveBeenCalled();
        });

        it('Expects that initialize returned promise is rejected if siteType is fetched but organizations are not successfully fetched', function() {
            fetchSiteTypeDeferred.resolve();
            fetchOrgDeferred.reject();
            expect(initializeSuccessSpy).not.toHaveBeenCalled();
            expect(initializeFailSpy).toHaveBeenCalled();
        });

        it('Expects that initialize returned promise is rejected if organization is fetched but siteTypes are not successfully fetched', function() {
            fetchSiteTypeDeferred.reject();
            fetchOrgDeferred.reject();
            expect(initializeSuccessSpy).not.toHaveBeenCalled();
            expect(initializeFailSpy).toHaveBeenCalled();
        });
    });

    it('Expects that invalid huc ids are flagged with an error message', function() {
        testView.initialize();
        $huc.val('071').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(1);

        $huc.val('07').trigger('change');
        expect($testDiv.has('.error-message').length).toBe(0);
    });

    it('Expects if valid huc data is entered that it is formatted as semi colon separate values with wild cards where needed', function() {
        testView.initialize();
        $huc.val('07;0801').trigger('change');
        expect($huc.val()).toEqual('07*;0801*');
    });

    it('Expects if that invalid counts are flagged with an error message', function() {
        testView.initialize();
        $minActivities.val('-23').trigger('change');

        expect($testDiv.has('.error-message').length).toBe(1);

        $minActivities.val('23').trigger('change');

        expect($testDiv.has('.error-message').length).toBe(0);
    });


});
