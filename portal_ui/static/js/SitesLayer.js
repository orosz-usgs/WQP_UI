function SitesLayer(layerName /* String */,
                    enableBoxId/* Boolean */,
                    selectFeatureFnc /* Event handler for featureselected */) {
    this._isBoxIDEnabled = enableBoxId;
    this._selectFeatureFnc = selectFeatureFnc;

    this.dataLayer = new OpenLayers.Layer.WMS(
            'Sites',
            Config.SITES_GEOSERVER_ENDPOINT + 'wms',
            {
                layers: layerName,
                styles: 'zoom_based_point',
                format: 'image/png',
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
    	// Because we are using a proxy for wfs and wps calls, but not for wms, we must clone the layer
    	// and change it's url to the proxy before creating the protocol. 
    	var dataLayer = this.dataLayer.clone();
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

