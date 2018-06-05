var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.nldiNavPopupView = (function() {
    var self = {};

    var NULL_TEMPLATE = function() {
        return 'Template has not been loaded';
    };

    var popupTemplate =  NULL_TEMPLATE;

    /*
     * Read handlebar templates
     */
    var template_loaded_promise = $.ajax({
        url : Config.STATIC_ENDPOINT + 'js/hbTemplates/nldiFeatureSourcePopup.hbs',
        cache: false,
        success : function(response) {
            popupTemplate = Handlebars.compile(response);
        },
        error : function( ) {
            log.error('Unable to read template hbTemplates/nldiFeatureSourcePopup.hbs');
        }
    });

    /*
     * Creates a nldi navigation popup onMap. The popup will contain information about the feature
     * and two inputs, a select and distance. When these are changed the PORTAL.MODELS.nldiModel is updated.
     * when the Navigate button in clicked the navHandler will be called.
     *
     * @param {L.Map} onMap - The map where the popup will be created
     * @param {Object} feature - contains properties that will be displayed on the popup
     * @param {L.LatLng} atLatLng - The popup will be opened at this lat lng
     * #param {Function} navHandler - This event handler will get called when the Navigate button is clicked in the popup.
     */
    self.createPopup = function(onMap, feature, atLatLng, navHandler) {
        var nldiData = PORTAL.MODELS.nldiModel.getData();
        var context = {
            nwisSite: nldiData.featureSource.id === 'nwissite',
            pourPoint: nldiData.featureSource.id === 'huc12pp',
            navigationModes: PORTAL.MODELS.nldiModel.NAVIGATION_MODES,
            feature : feature
        };
        var $navButton;

        template_loaded_promise.always(function() {
            onMap.openPopup(popupTemplate(context), atLatLng);
            $navButton = $('.navigation-selection-div button');
            $('.navigation-selection-div select').change(function (ev) {
                var $select = $(ev.target);
                var selectedValue = $select.val();
                var navValue = {
                    id: selectedValue,
                    text: $(ev.target.selectedOptions[0]).html()
                };

                PORTAL.MODELS.nldiModel.setData('navigation', navValue);
                $navButton.prop('disabled', !navValue.id);
            });
            $('.navigation-selection-div input[type="text"]').change(function (ev) {
                PORTAL.MODELS.nldiModel.setData('distance', $(ev.target).val());
            });
            $navButton.click(navHandler);
        });
    };

    self.template_loaded = template_loaded_promise;

    return self;
})();
