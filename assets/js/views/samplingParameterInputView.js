import * as dateValidator from '../dateValidator';
import InputValidation from './inputValidationView';
import { CodeSelect, PagedCodeSelect } from './portalViews';


var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the sampling parameter inputs are contained
 *      @prop {PORTAL.MODELS.cachedCodes} sampleMediaModel
 *      @prop {PORTAL.MODELS.cachedCodes} characteristicTypeModel
 * @return {Object}
    *   @func initialize
 */
PORTAL.VIEWS.samplingParameterInputView = function(options) {
    var self = {};

    /*
     * Initializes and sets up the DOM event handlers for the inputs
     * @return Jquery.promise
     *      @resolve - all models have been successfully fetched
     *      @reject - one or models have not been successfully fetched
     */
    self.initialize = function() {
        var $sampleMedia = options.$container.find('#sampleMedia');
        var $characteristicType = options.$container.find('#characteristicType');
        var $characteristicName = options.$container.find('#characteristicName');
        var $projectCode = options.$container.find('#project-code');
        var $minresults = options.$container.find('#minresults');
        var $startDate = options.$container.find('#startDateLo');
        var $endDate = options.$container.find('#startDateHi');

        var fetchSampleMedia = options.sampleMediaModel.fetch();
        var fetchCharacteristicType = options.characteristicTypeModel.fetch();
        var fetchComplete = $.when(fetchSampleMedia, fetchCharacteristicType);

        fetchSampleMedia.done(function() {
            new CodeSelect($sampleMedia, {model : options.sampleMediaModel});
        });
        fetchCharacteristicType.done(function() {
            new CodeSelect($characteristicType, {model : options.characteristicTypeModel});
        });

        new PagedCodeSelect($characteristicName, {codes: 'characteristicname'}, {closeOnSelect : false});
        new PagedCodeSelect($projectCode, {codes: 'project'},
            {closeOnSelect : false}
        );

        // Add input validations and reformatting handlers
        new InputValidation({
            inputEl : $minresults,
            validationFnc : PORTAL.validators.positiveIntValidator
        });
        new InputValidation({
            inputEl: $startDate,
            validationFnc: dateValidator.validate,
            updateFnc: function (value) {
                return dateValidator.format(value, true);
            }
        });
        new InputValidation({
            inputEl: $endDate,
            validationFnc: dateValidator.validate,
            updateFnc: function (value) {
                return dateValidator.format(value, false);
            }
        });

        return fetchComplete;
    };

    return self;
};
