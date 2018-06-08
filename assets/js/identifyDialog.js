import reject from 'lodash/collection/reject';

import featureInfoTemplate from './hbTemplates/featureInfo.hbs';
import hiddenFormTemplate from './hbTemplates/hiddenForm.hbs';


// Only show this many features in the dialog. Also use alternative download based on the bounding box of the
// features that are shown.
const FEATURE_LIMIT = 50;

/*
 * @param {Object} options
 *      @prop {Jquery element} $dialog - Contains the identify dialog
 *      @prop {Jquery element} $popover - Contains the div where the popover identifier will be rendered.
 */
export default class IdentifyDownload {
    constructor({$dialog, $popover}) {
        this.$dialog = $dialog;
        this.$popover = $popover;
    }

    initialize(closeActionFnc) {
        var closeFunc = closeActionFnc ? closeActionFnc : undefined;

        // Initialize UI dialog
        this.$dialog.find('#download-map-info-button').click(function() {
            var resultType = this.$dialog.find('input[name="resultType"]:checked').val();
            var $form = this.$dialog.find('form');
            var url = PORTAL.queryServices.getFormUrl(resultType);

            $form.attr('action', url);
            window._gaq.push(['_trackEvent', 'Portal Page', 'IdentifyDownload' + resultType, url + '?' + $form.serialize()]);
            $form.submit();
        });

        this.$dialog.dialog({
            autoOpen: false,
            modal: false,
            title: 'Detailed site information',
            width: 450,
            height: 400,
            close: closeFunc
        });

        //Initialize popover
        this.$popover.on('hide.bs.popover', closeFunc);
    }

    /*
     * @param {Object} showOptions
     *      @prop {Array of Object} features - json object representing the features from a WFS GetFeature call.
     *      @prop {Array of Object} with name and value properties} queryParamArray
     *      @prop {String or Array} boundingBox - string which is suitable to send as the WQP service bBox parameter value or an
     *          extent [minX, minY, maxX, maxY]. In both cases the service expects the parameters to be in degrees (geographic
     *          coordinates)
     *      @prop {Boolean} usePopover - function returns true if the popover dialog should be used rather than
     *          the UI dialog. The UI dialog includes the download features. The popover dialog will only show
     *          the site information
     */
    showDialog(showOptions) {
        var exceedsFeatureLimit = showOptions.features.length > FEATURE_LIMIT;
        var $detailDiv = this.$dialog.find('#map-info-details-div');
        var $hiddenFormInputDiv = this.$dialog.find('#map-id-hidden-input-div');

        var context = {
            features: showOptions.features,
            exceedsFeatureLimit: exceedsFeatureLimit,
            boundingBox: showOptions.boundingBox,
            queryParamArray: reject(showOptions.queryParamArray, function (param) {
                return param.name === 'bBox' || param.name === 'mimeType';
            })
        };

        if (showOptions.usePopover) {
            this.$popover.popover('destroy');
            if (showOptions.features.length > 0) {
                this.$popover.popover({
                    placement: 'top',
                    animation: false,
                    content: featureInfoTemplate(context),
                    html: true
                });
                this.$popover.popover('show');
            }
        } else {
            if (showOptions.features.length > 0) {
                $detailDiv.html(featureInfoTemplate(context));
                $hiddenFormInputDiv.html(hiddenFormTemplate(context));

                this.$dialog.dialog('open');
            } else {
                this.$dialog.dialog('close');
            }
        }
    }
}
