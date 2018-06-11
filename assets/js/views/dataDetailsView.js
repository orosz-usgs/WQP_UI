import { setEnabled } from '../utils';


/*
 * Manages the data detail inputs view
 * @param {Object} options
 *      @prop {Jquery element} $container - The div where the data detail inputs are contained
 *      @func updateResultTypeAction - called whenever the result-type radio buttons are changed
 *          @param {String} resultType - the checked radio button's value
 * @return {Object}
 *      @func initialize
 *      @func getResultType
 *      @func getMimeType
 */
export default class DataDetailsView {
    constructor({$container, updateResultTypeAction}) {
        this.$container = $container;
        this.updateResultTypeAction = updateResultTypeAction;
    }

    /*
     * Initializes the widgets and sets up the DOM event handlers.
     */
    initialize() {
        var $kml = this.$container.find('#kml');

        var $site = this.$container.find('#sites');
        var $biosamples = this.$container.find('#biosamples');
        var $narrowResults = this.$container.find('#narrowsamples');

        var $sorted = this.$container.find('#sorted');
        var $hiddenSorted = this.$container.find('input[type="hidden"][name="sorted"]');
        var $mimeTypeRadioboxes = this.$container.find('input[name="mimeType"]');
        var $resultTypeRadioboxes = this.$container.find('input.result-type');

        $mimeTypeRadioboxes.change(() => {
            var kmlChecked = $kml.prop('checked');

            // Can only download sites if kml is checked
            setEnabled(this.$container.find('.result-type:not(#sites)'), !kmlChecked);
        });

        $resultTypeRadioboxes.change((event) => {
            var node = event.currentTarget;
            var resultType = $(node).val();
            var $dataProfile = this.$container.find('input[name="dataProfile"]');

            // Uncheck previously checked button
            this.$container.find('input.result-type:checked').not(node).prop('checked', false);

            setEnabled($kml, $site.prop('checked'));

            // If biological results or narrow results desired add a hidden input, otherwise remove it.
            $dataProfile.remove();
            if ($biosamples.prop('checked')) {
                this.$container.append('<input type="hidden" name="dataProfile" value="biological" />');

            } else if ($narrowResults.prop('checked')){
                this.$container.append('<input type="hidden" name="dataProfile" value="narrowResult" />');
            }
            this.updateResultTypeAction(resultType);
        });

        $sorted.change(function () {
            var val = $(this).is(':checked') ? 'yes' : 'no';
            $hiddenSorted.val(val);
        });
    }

    getResultType() {
        return this.$container.find('input.result-type:checked').val();
    }

    getMimeType() {
        return this.$container.find('input[name="mimeType"]:checked').val();
    }
}
