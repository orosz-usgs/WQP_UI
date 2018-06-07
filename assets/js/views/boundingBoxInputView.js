var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

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
        var $textInputs = this.$container.find('input[type="text"]');
        var $north = this.$container.find('#north');
        var $south = this.$container.find('#south');
        var $west = this.$container.find('#west');
        var $east = this.$container.find('#east');
        PORTAL.VIEWS.inputValidation({
            inputEl: $textInputs,
            validationFnc: PORTAL.validators.realNumberValidator
        });

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
            this.$container.find('input[name="bBox"]').val(bboxVal);
        });
    }
}
