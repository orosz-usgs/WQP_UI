
function PortalDataMap (mapDivId, updateDivId, identifyDialog /* IdentifyDialog object */){
    var WPS_URL = Config.GEOSERVER_ENDPOINT + '/ows?service=WPS&version=1.0.0&request=Execute';
    var BASE_LAYERS = ['world_topo', 'world_street', 'world_relief','world_imagery'];

    this.map = new OpenLayers.Map(mapDivId, MapUtils.MAP_OPTIONS); //  OpenLayer map

    // Attempt to create box identify control
    this.identifyTool = new OpenLayers.Control.Button({
        displayClass: 'identify-button',
        type : OpenLayers.Control.TYPE_TOGGLE,
        title: 'Toggle to enable box identify. Click and drag to draw rectangle area of interest.',
        eventListeners: {
            activate : function() {
                this._boxIdentifyOn = true;
                this.toggleBoxId();
            },
            deactivate : function() {
                this._boxIdentifyOn = false;
                this.toggleBoxId();
            },
            scope : this
        }
    });
    this.toolPanel = new OpenLayers.Control.Panel({
        createControlMarkup: function(control) {
            var button = document.createElement('button');
            return button;
        }
    });
    this.toolPanel.addControls([this.identifyTool]);
    this.map.addControl(this.toolPanel);
    this.dataLayer = null; // The displayed dataLayer. This will be a SitesLayer object.

    this._boxIdentifyOn = false;
    this._updateDivEl = $('#' + updateDivId);
    this._identifyDialog = identifyDialog;
    this._popupIdentify;


    this._selectBoxLayer = new OpenLayers.Layer.Vector('selectBoxLayer', {
        displayInLayerSwitcher: false,
        isBaseLayer : false
    });
    this.map.addLayer(this._selectBoxLayer);
    this._updateSelectBoxLayer = function () {
        this._selectBoxLayer.destroyFeatures();
        this._selectBoxLayer.addFeatures(this.dataLayer.idFeatureControl.getSelectBoxFeatures());
    };

    this._identifyDialog.create(this);


    this.timerId = {};
    this.completeFnc = null; // Function to call when mapping process completes


    /* Initialize the portal data map */
    OpenLayers.ProxyHost = ""

    // Add loading panel control
    var loadingPanel = new OpenLayers.Control.LoadingPanel();
    this.map.addControl(loadingPanel);

    // Add base layers
    var baseLayers = [];
    for (var i = 0; i < BASE_LAYERS.length; i++) {
        baseLayers[i] = MapUtils.getLayer(
            MapUtils.BASE_LAYERS[BASE_LAYERS[i]],
            {
                isBaseLayer: true,
                transitionEffect: 'resize'
            });
    }
    this.map.addLayers(baseLayers);

    MapUtils.getNWISSitesLayer().then(function(layer) {
    	this.map.addLayer(layer);
    }.bind(this));

    // Initialize map center and zoom level.
    this.map.zoomTo(3);
    var center = new OpenLayers.LonLat(MapUtils.DEFAULT_CENTER.lon, MapUtils.DEFAULT_CENTER.lat);
    this.map.setCenter(center.transform(MapUtils.WGS84_PROJECTION, MapUtils.MERCATOR_PROJECTION));

    this.toggleBoxId = function() {
        if (this.dataLayer) {
            this.dataLayer.enableBoxId(this.map, this._boxIdentifyOn);
        }
    };

    this.cancelIdentifyOp = function() {
        /* Cleans up the select Box. */
        this._selectBoxLayer.destroyFeatures();
    };

    this.cancelMapping = function() {
        window.clearInterval(this.timerId);
        this.timerId = {};
        this._updateDivEl.hide();
        if (this.completeFnc) {
            this.completeFnc();
            this.completeFnc = null;
        }
    };
    
    /*
     * Removes the previous data layer if any and any identification dialogs. Retrieves
     * and displays the new data layer
     * @param {Array of {Object with name and value properties}} formParams
     */
    this.showDataLayer = function(formParams, loadendCallback) {
    	var self = this;
    	// Clean up previous data Layer
        if (this.dataLayer) {
            this.dataLayer.removeFromMap(this.map);
            this._selectBoxLayer.destroyFeatures();
            this.map.removeLayer(this._selectBoxLayer);
        }
        if (this._identifyDialog.dialogEl.dialog('isOpen')) {
            this._identifyDialog.dialogEl.dialog('close');
        }
        if (this._popupIdentify) {
            this.map.removePopup(this._popupIdentify);
        }
        this.dataLayer = new SitesLayer(
        		formParams,
        		loadendCallback,
                this._boxIdentifyOn,
                function(ev, selectBoundingBox) {
                    var siteIds = [];
                    var degreeBBox;
                    var i;

                    self._updateSelectBoxLayer();
                    // If we are on an extra small device, use an openlayers popup and
                    // just display the site ids
                    for (i = 0; i < ev.features.length; i++) {
                         siteIds.push(ev.features[i].attributes.id);
                    }
                    if ($('body').width() < 750) {
                        PORTAL.CONTROLLER.retrieveSiteIdInfo(siteIds, function(html) {
                            this._popupIdentify = new OpenLayers.Popup.FramedCloud(
                                'idPopup',
                                selectBoundingBox.getCenterLonLat(),
                                null,
                                html,
                                null,
                                true,
                                function() {
                                    self._popupIdentify = null;
                                    self.cancelIdentifyOp();
                                    self.destroy();
                                }
                            );
                            self.map.addPopup(this._popupIdentify, true);
                        });
                    }
                    else {
                        degreeBBox = selectBoundingBox.transform(MapUtils.MERCATOR_PROJECTION, MapUtils.WGS84_PROJECTION);
                        self._identifyDialog.updateAndShowDialog(siteIds, degreeBBox, formParams);
                    }
                }
        );
        
        this.dataLayer.addToMap(this.map);
        this.map.addLayer(this._selectBoxLayer);
        
    };
};
