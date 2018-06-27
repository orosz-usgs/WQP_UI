import * as dateValidator from '../dateValidator';
import InputValidation from './inputValidationView';
import { CodeSelect, PagedCodeSelect } from './portalViews';

import { positiveIntValidator } from '../portalValidators';
import { getAnchorQueryValues, initializeInput } from '../utils';

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
        let $sampleMedia = this.$container.find('#sampleMedia');
        let $characteristicType = this.$container.find('#characteristicType');
        let $characteristicName = this.$container.find('#characteristicName');
        let $projectCode = this.$container.find('#project-code');
        let $pcode = this.$container.find('#pCode');
        let $minresults = this.$container.find('#minresults');
        let $startDate = this.$container.find('#startDateLo');
        let $endDate = this.$container.find('#startDateHi');

        let fetchSampleMedia = this.sampleMediaModel.fetch();
        let fetchCharacteristicType = this.characteristicTypeModel.fetch();
        let fetchComplete = $.when(fetchSampleMedia, fetchCharacteristicType);

        fetchSampleMedia.done(() => {
            new CodeSelect(
                $sampleMedia,
                {
                    model : this.sampleMediaModel
                },
                {},
                getAnchorQueryValues($sampleMedia.attr('name'))
            );
        });
        fetchCharacteristicType.done(() => {
            new CodeSelect(
                $characteristicType,
                {
                    model : this.characteristicTypeModel
                },
                {},
                getAnchorQueryValues($characteristicType.attr('name'))
            );
        });

        new PagedCodeSelect(
            $characteristicName,
            {
                codes: 'characteristicname'
            },
            {
                closeOnSelect : false
            },
            null,
            null,
            getAnchorQueryValues($characteristicName.attr('name'))
        );
        new PagedCodeSelect(
            $projectCode,
            {
                codes: 'project'
            },
            {
                closeOnSelect : false
            },
            null,
            null,
            getAnchorQueryValues($projectCode.attr('name'))
        );

        initializeInput($pcode);
        initializeInput($minresults);
        initializeInput($startDate);
        initializeInput($endDate);

        // Add input validations and reformatting handlers
        new InputValidation({
            inputEl : $minresults,
            validationFnc : positiveIntValidator
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

    resetContainer() {
        let $inputs = this.$container.find(':input[name]');
        $inputs.val('');
        $inputs.trigger('change');
    }
}
