/* global Option */

import dialogTemplate from './hbTemplates/identifyDialog.hbs';


// Only show this many features in the dialog. Also use alternative download based on the bounding box of the
// features that are shown.
const FEATURE_LIMIT = 50;

const SITE_ID_PARAMETER = 'siteid';


export const showIdentifyDialog  = function(map, atLatLng, features) {

    if (features.features.length) {
        const exceedsFeatureLimit = features.features.length > FEATURE_LIMIT;
        const context = {
            features: features.features,
            FEATURE_LIMIT: FEATURE_LIMIT,
            exceedsFeatureLimit: exceedsFeatureLimit
        };

        map.openPopup(dialogTemplate(context), atLatLng);
        $('#identify-populate-button').click(() => {
            if (exceedsFeatureLimit) {
                $('#south').val(features.bbox[0]);
                $('#west').val(features.bbox[1]);
                $('#north').val(features.bbox[2]);
                $('#east').val(features.bbox[3]).trigger('change');
            } else {
                let $siteIdSelect = $(`select[name="${SITE_ID_PARAMETER}"]`);
                $siteIdSelect.val('');
                features.features.forEach((f) => {
                    let option = new Option(f.properties.name, f.properties.name, true, true);

                    $siteIdSelect.append(option).trigger('change');
                    $siteIdSelect.trigger('select2:select');
                });

            }
        });
    } else {
        map.closePopup();
    }
};