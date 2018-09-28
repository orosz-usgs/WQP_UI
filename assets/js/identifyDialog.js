
import dialogTemplate from './hbTemplates/identifyDialog.hbs';


// Only show this many features in the dialog. Also use alternative download based on the bounding box of the
// features that are shown.
const FEATURE_LIMIT = 50;

const SITE_ID_PARAMETER = 'siteid';
const BBOX_PARAMETER = 'bBox';

export const showIdentifyDialog  = function(map, atLatLng, features) {

    if (features.length) {
        const exceedsFeatureLimit = features.length > FEATURE_LIMIT;
        const context = {
            features: features,
            FEATURE_LIMIT: FEATURE_LIMIT,
            exceedsFeatureLimit: exceedsFeatureLimit
        };

        map.openPopup(dialogTemplate(context), atLatLng);
        $('#identify-populate-button').click(() => {
            console.log('Add code to popuplate the form');
        });
    } else {
        map.closePopup();
    }
};