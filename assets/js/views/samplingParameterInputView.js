import * as dateValidator from '../dateValidator';
import InputValidation from './inputValidationView';
import { CodeSelect, PagedCodeSelect } from './portalViews';


var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the sampling parameter inputs are contained
 *      @prop {CachedCodes} sampleMediaModel
 *      @prop {CachedCodes} characteristicTypeModel
 * @return {Object}
    *   @func initialize
 */
export default class SamplingParameterInputView {

    constructor({$container, sampleMediaModel, characteristicTypeModel}) {
        this.$container = $container;
        this.sampleMediaModel = sampleMediaModel;
        this.characteristicTypeModel = characteristicTypeModel;
    }

    /*
     * Initializes and sets up the DOM event handlers for the inputs
     * @return Jquery.promise
     *      @resolve - all models have been successfully fetched
     *      @reject - one or models have not been successfully fetched
     */
    initialize() {
        var $sampleMedia = this.$container.find('#sampleMedia');
        var $characteristicType = this.$container.find('#characteristicType');
        var $characteristicName = this.$container.find('#characteristicName');
        var $projectCode = this.$container.find('#project-code');
        var $minresults = this.$container.find('#minresults');
        var $startDate = this.$container.find('#startDateLo');
        var $endDate = this.$container.find('#startDateHi');

        var fetchSampleMedia = this.sampleMediaModel.fetch();
        var fetchCharacteristicType = this.characteristicTypeModel.fetch();
        var fetchComplete = $.when(fetchSampleMedia, fetchCharacteristicType);

        fetchSampleMedia.done(() => {
            new CodeSelect($sampleMedia, {model : this.sampleMediaModel});
        });
        fetchCharacteristicType.done(() => {
            new CodeSelect($characteristicType, {model : this.characteristicTypeModel});
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
    }
}
