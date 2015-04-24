
/*'
 * Provides methods to create a site layer and to add an id control
 * @param {Array of {Object - with name and value properties} formParams
 * @param {Boolean} enableBoxId
 * @param {Function} selectFeatureFnc - function to execute when selecting features on the layer
 * @returns {Object}
 */

function SitesLayer(formParams,
					enableBoxId,
                    selectFeatureFnc) {
    this._isBoxIDEnabled = enableBoxId;
    this._selectFeatureFnc = selectFeatureFnc;
    
    var getSearchParams = function(formParams) {
    	var result = [];
    	$.each(formParams, function(index, param) {
    		var paramStr = param.name + ':' + param.value.replace(';', '|');
    		result.push(paramStr);
    	});
    	return result.join(';');   	
    };

    this.dataLayer = new OpenLayers.Layer.WMS(
            'Sites',
            Config.SITES_GEOSERVER_ENDPOINT + 'wms',
            {
                layers: 'wqp_sites',
                styles: 'wqp_sources',
                format: 'image/png',
                transparent: true,
                searchParams : getSearchParams(formParams)
            },
            {
                displayInLayerSwitcher: false,
                isBaseLayer: false,
                transitionEffect: 'resize',
                singleTile: true,
                visibility: true,
                opacity: 0.75
            }
    );

    this._createIdControl = function() {
    	var protocol = OpenLayers.Protocol.WFS.fromWMSLayer(this.dataLayer);
        this.idFeatureControl = new WQPGetFeature({
            protocol: protocol,
            box: this._isBoxIDEnabled,
            click: !this._isBoxIDEnabled,
            clickTolerance: 5,
            single: false,
            maxFeatures: 50
            }
        );

        this.idFeatureControl.events.register('featuresselected', this, function(ev) {
            this._selectFeatureFnc(ev, this.idFeatureControl.getLastBoundingBox());
        });
    };

    this.idFeatureControl = null;

    this.addToMap = function(map /* OpenLayers map object */) {
        map.addLayer(this.dataLayer);

        this._createIdControl();
        map.addControl(this.idFeatureControl);
        this.idFeatureControl.activate();
    };

    this.removeFromMap = function(map /* OpenLayers map object */) {
        this.idFeatureControl.deactivate();
        map.removeControl(this.idFeatureControl);
        map.removeLayer(this.dataLayer);
    };

    this.enableBoxId = function(map /* OpenLayer map object */, on /* Boolean */) {

        if (this._isBoxIDEnabled !== on) {
            this._isBoxIDEnabled = on;

            this.idFeatureControl.deactivate();
            map.removeControl(this.idFeatureControl);

            this._createIdControl();

            map.addControl(this.idFeatureControl);
            this.idFeatureControl.activate();
        }
    };
};

