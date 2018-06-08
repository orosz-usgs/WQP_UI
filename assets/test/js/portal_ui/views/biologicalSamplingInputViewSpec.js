import BiologicalSamplingInputView from '../../../../js/views/biologicalSamplingInputView';
import { CodeSelect } from '../../../../js/views/portalViews';


describe('Tests for biologicalSamplingInputView', function() {
    var testView;
    var $testDiv;
    var $assemblage, $taxonomicName;

    var assemblageModel;
    var fetchAssemblageDeferred;

    beforeEach(function() {
        $('body').append('<div id="test-div">' +
            '<select multiple id="assemblage"></select>' +
            '<select multiple id="subject-taxonomic-name"></select>' +
            '</div>'
        );
        $testDiv = $('#test-div');
        $assemblage = $('#assemblage');
        $taxonomicName = $('#subject-taxonomic-name');

        fetchAssemblageDeferred = $.Deferred();
        assemblageModel = {
            fetch : jasmine.createSpy('assemblageModelFetch').and.returnValue(fetchAssemblageDeferred)
        };

        spyOn($.fn, 'select2').and.callThrough();
        spyOn(CodeSelect.prototype, 'initialize');

        testView = new BiologicalSamplingInputView({
            $container: $testDiv,
            assemblageModel : assemblageModel
        });
    });

    afterEach(function() {
        $testDiv.remove();
    });

    it('Expects that the assemblage model is fetched at initialization', function() {
        testView.initialize();
        expect(assemblageModel.fetch).toHaveBeenCalled();
    });

    it('Expects that the taxonomic select is initialized', function() {
        testView.initialize();
        expect($.fn.select2).toHaveBeenCalled();
        expect($.fn.select2.calls.mostRecent().object.attr('id')).toEqual($taxonomicName.attr('id'));
    });

    it('Expects that the assemblage select is initialized after the assemblage model is fetched', function() {
        testView.initialize();
        expect(CodeSelect.prototype.initialize).not.toHaveBeenCalled();

        fetchAssemblageDeferred.resolve();
        expect(CodeSelect.prototype.initialize).toHaveBeenCalled();
        expect(CodeSelect.prototype.initialize.calls.argsFor(0)[0].attr('id')).toEqual($assemblage.attr('id'));
    });

    describe('Tests for promise returned from initialize', function() {
        var initializeSuccessSpy, initializeFailSpy;

        beforeEach(function () {
            initializeSuccessSpy = jasmine.createSpy('initializeSuccessSpy');
            initializeFailSpy = jasmine.createSpy('initializeFailSpy');

            testView.initialize().done(initializeSuccessSpy).fail(initializeFailSpy);
        });

        it('Expects that initialize returned promise is not resolved until assemblage have been successfully fetched', function (done) {
            expect(initializeSuccessSpy).not.toHaveBeenCalled();
            expect(initializeFailSpy).not.toHaveBeenCalled();

            fetchAssemblageDeferred.resolve();
            window.setTimeout(function() {
                expect(initializeSuccessSpy).toHaveBeenCalled();
                expect(initializeFailSpy).not.toHaveBeenCalled();
                done();
            }, 100);
        });

        it('Expects that initialize returned promise is rejected if assemblage is not successfully fetched', function(done) {
            fetchAssemblageDeferred.reject();

            window.setTimeout(function() {
                expect(initializeSuccessSpy).not.toHaveBeenCalled();
                expect(initializeFailSpy).toHaveBeenCalled();
                done();
            }, 100);
        });
    });
});
