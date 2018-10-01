/* global Option */

import dialogTemplate from './hbTemplates/identifyDialog.hbs';


// Only show this many features in the dialog. Also use alternative download based on the bounding box of the
// features that are shown.
const FEATURE_LIMIT = 50;

const SITE_ID_PARAMETER = 'siteid';
const NORTH_ID = '#north';
const SOUTH_ID = '#south';
const WEST_ID = '#west';
const EAST_ID = '#east';

/*
 * Make the identify dialog visible on map with popup positioned atLatLng. The identify contents
 * should contain the features.
 * @param {L.Map} map
 * @param {L.LatLng} atLatLng
 * @param {Object} features - response from a GetFeature request
 */
export const showIdentifyDialog  = function({map, atLatLng, features}) {

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
                $(SOUTH_ID).val(features.bbox[0]);
                $(WEST_ID).val(features.bbox[1]);
                $(NORTH_ID).val(features.bbox[2]);
                $(EAST_ID).val(features.bbox[3]).trigger('change');
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