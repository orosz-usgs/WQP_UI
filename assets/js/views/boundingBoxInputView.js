import InputValidation from './inputValidationView';

import { realNumberValidator } from '../portalValidators';
import { getAnchorQueryValues } from '../utils';

/*
 * Creates a bounding box input view object
 * @param {Object} options
 *      @prop {Jquery element} $container - element where the bounding box inputs are contained
 * @returns {Object}
 *      @func initialize;
 */
export default class BoundingBoxInputView {

    constructor({$container}) {
        this.$container = $container;
    }

    /*
     * Initializes all input widgets and DOM event handlers
     */
    initialize() {
        let $textInputs = this.$container.find('input[type="text"]');
        let $north = this.$container.find('#north');
        let $south = this.$container.find('#south');
        let $west = this.$container.find('#west');
        let $east = this.$container.find('#east');
        let $bbox = this.$container.find('input[name="bBox"]');

        new InputValidation({
            inputEl: $textInputs,
            validationFnc: realNumberValidator
        });

        const initBboxValues = getAnchorQueryValues('bBox');
        if (initBboxValues.length) {
            const bboxVals = initBboxValues[0].split(',');
            if (bboxVals.length === 4) {
                $west.val(bboxVals[0]);
                $south.val(bboxVals[1]);
                $east.val(bboxVals[2]);
                $north.val(bboxVals[3]);
                $bbox.val(initBboxValues[0]);
            }
        }

        //Update bBox hidden input if any of the bounding box text fields are updated
        $textInputs.change(() => {
            var north = $north.val();
            var south = $south.val();
            var east = $east.val();
            var west = $west.val();
            var bboxVal = '';
            if (north && south && east && west) {
                bboxVal = west + ',' + south + ',' + east + ',' + north;
            }
            $bbox.val(bboxVal);
        });
    }
}
