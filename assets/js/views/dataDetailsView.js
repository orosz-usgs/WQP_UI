import { setEnabled, initializeInput, getAnchorQueryValues } from '../utils';


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
        let $kml = this.$container.find('#kml');

        let $site = this.$container.find('#sites');
        let $biosamples = this.$container.find('#biosamples');
        let $narrowResults = this.$container.find('#narrowsamples');

        let $sorted = this.$container.find('#sorted');
        let $hiddenSorted = this.$container.find('input[type="hidden"][name="sorted"]');
        let $mimeTypeRadioboxes = this.$container.find('input[name="mimeType"]');
        let $resultTypeRadioboxes = this.$container.find('input.result-type');


        initializeInput($hiddenSorted);
        const sortedInitValues = getAnchorQueryValues($hiddenSorted.attr('name'));
        if (sortedInitValues.length) {
            $sorted.prop('checked', sortedInitValues[0] === 'yes');
        }
        const mimeTypeInitValues = getAnchorQueryValues($mimeTypeRadioboxes.attr('name'));
        if (mimeTypeInitValues.length) {
            this.$container.find(`input[value="${mimeTypeInitValues[0]}"]`).prop('checked', true);
            // Need to disable checkboxes for download other that sites.
            if (mimeTypeInitValues[0] === 'kml') {
                setEnabled(this.$container.find('.result-type:not(#sites)'), false);
            }
        }

        $mimeTypeRadioboxes.change(() => {
            const kmlChecked = $kml.prop('checked');

            // Can only download sites if kml is checked
            setEnabled(this.$container.find('.result-type:not(#sites)'), !kmlChecked);
        });

        $resultTypeRadioboxes.change((event) => {
            const node = event.currentTarget;
            const resultType = $(node).val();
            let $dataProfile = this.$container.find('input[name="dataProfile"]');

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
            const val = $(this).is(':checked') ? 'yes' : 'no';
            $hiddenSorted.val(val).trigger('change');
        });

        $hiddenSorted.change(() => {
            if (!$hiddenSorted.val()) {
                $sorted.prop('checked', false);
            }
        })
    }

    getResultType() {
        return this.$container.find('input.result-type:checked').val();
    }

    getMimeType() {
        return this.$container.find('input[name="mimeType"]:checked').val();
    }
}
