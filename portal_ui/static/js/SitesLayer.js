function SitesLayer(layerName /* String */,
                    enableBoxId/* Boolean */,
                    selectFeatureFnc /* Event handler for featureselected */) {
    this._isBoxIDEnabled = enableBoxId;
    this._selectFeatureFnc = selectFeatureFnc;

    this.dataLayer = new OpenLayers.Layer.WMS(
            'Sites',
            Config.GEOSERVER_ENDPOINT + '/ows',
            {
                layers: layerName,
                styles: 'zoom_based_point',
                        transparent: true
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
    	var dataLayer = this.dataLayer.clone();
    	dataLayer.url = Config.GEOSERVER_PROXY_ENDPOINT + 'ows';
    	var protocol = OpenLayers.Protocol.WFS.fromWMSLayer(dataLayer);
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

