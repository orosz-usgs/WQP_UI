
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

    this.fetchDataLayer = function(
        formParams /* array of object {'name' : xx, 'value': xx } */,
        complete /* function to call when operation is complete whether it succeeded or failed */) {
        /*
         * Start the process to retrieve the data layer represented by the parameters in formID.
         * Display status message in updateDivID. Once data layer generation is complete, display the
         * new layer.
         */

        this.completeFnc = complete;
        // Show the updateDivId and update the message to indicate that processing has started.
        this._updateDivEl.find('span').html('Transferring data, please be patient');
        this._updateDivEl.show();

        var theseFormParams = formParams;
        var thisPortalDataMap = this;
        OpenLayers.Request.POST({
            url : Config.GEOSERVER_PROXY_ENDPOINT + 'ows?identifier=gs:SiteImport',
            data : SiteImportWPSUtils.getRequestXML('gs:SiteImport', formParams),
            success: function(data) {
                // Poll the process status WPS to determine the current status of building the new
                // data layer. Before making a new status request, check to see if the current
                // request has completed by checking the status.

                this.statusRequest = {status : 200};
                thisPortalDataMap.timerId = window.setInterval(
                    function() {
                        if (this.statusRequest.status) {
                            this.statusRequest = OpenLayers.Request.POST({
                                url : Config.GEOSERVER_PROXY_ENDPOINT + 'ows?identifier=gs:SingleWpsStatus',
                                data: SiteImportWPSUtils.getRequestXML(
                                    'gs:SingleWpsStatus',
                                    [{ name : 'layerName', value : data.responseText}]),
                                success: function(data) {
                                    processStatus(data, thisPortalDataMap, theseFormParams);
                                },
                                failure: function(data) {
                                    processServiceFailure(thisPortalDataMap, 'Unable to contact map server for status: ' + data.status);
                                }
                            });
                        }
                    },
                    1000
                );
            },
            failure: function(data) {
                processServiceFailure(thisPortalDataMap, 'Unable to contact map server with status: ' + data.status);
            }
        });
    };
};

function processStatus (responseData /* object returned from WPS Post*/, portalDataMap, formParams){
    // Process the AggregateSiteProcessStatus response. Once complete, clear the timer, display the layer
    // or error message as appropriate.
    var response = $.parseJSON(responseData.responseText);
    var updateEl = portalDataMap._updateDivEl.find('span');
    switch (response.requestStatusType) {
        case 'RECEIVED':
        case 'BLOCKED' :
        case 'STARTED' :
        case 'LOADING_COUNT':
            updateEl.html('Transferring data, please be patient');
            break;

        case 'LOADING_VALUES' :
            if (response.visitedRecords) {
                updateEl.html('Constructing data layer ' + response.percentComplete + '%');
            }
            else {
                updateEl.html('Transferring data, please be patient');
            }
            break;

        case 'BUILDING_LAYER':
            updateEl.html('Building map layer, please be patient');
            break;

        case 'COMPLETE':
            portalDataMap.cancelMapping();

            // Clean up previous data Layer
            if (portalDataMap.dataLayer) {
                portalDataMap.dataLayer.removeFromMap(portalDataMap.map);
                portalDataMap._selectBoxLayer.destroyFeatures();
                portalDataMap.map.removeLayer(portalDataMap._selectBoxLayer);
            }
            if (portalDataMap._identifyDialog.dialogEl.dialog('isOpen')) {
                portalDataMap._identifyDialog.dialogEl.dialog('close');
            }
            if (portalDataMap._popupIdentify) {
                portalDataMap.map.removePopup(portalDataMap._popupIdentify);
            }

            portalDataMap.dataLayer =
                new SitesLayer(response.layerName,
                   portalDataMap._boxIdentifyOn,
                   function(ev, selectBoundingBox) {
                       var siteIds = [];
                       var degreeBBox;
                       var i;

                       portalDataMap._updateSelectBoxLayer();
                       // If we are on an extra small device, use an openlayers popup and
                       // just display the site ids
                       for (i = 0; i < ev.features.length; i++) {
                            siteIds.push(ev.features[i].attributes.id);
                       }
                       if ($('body').width() < 750) {
                           PORTAL.CONTROLLER.retrieveSiteIdInfo(siteIds, function(html) {
                               portalDataMap._popupIdentify = new OpenLayers.Popup.FramedCloud(
                                   'idPopup',
                                   selectBoundingBox.getCenterLonLat(),
                                   null,
                                   html,
                                   null,
                                   true,
                                   function() {
                                       portalDataMap._popupIdentify = null;
                                       portalDataMap.cancelIdentifyOp();
                                       this.destroy();
                                   }
                               );
                               portalDataMap.map.addPopup(portalDataMap._popupIdentify, true);
                           });
                       }
                       else {
                           degreeBBox = selectBoundingBox.transform(MapUtils.MERCATOR_PROJECTION, MapUtils.WGS84_PROJECTION);
                           portalDataMap._identifyDialog.updateAndShowDialog(siteIds, degreeBBox, formParams);
                       }
                   }
            );
            portalDataMap.dataLayer.addToMap(portalDataMap.map);
            portalDataMap.map.addLayer(portalDataMap._selectBoxLayer);

            break;

        default:
            portalDataMap.cancelMapping();
            alert('Unable to get data for map: ' + response.requestStatusDescription);
    }
};

function processServiceFailure(portalDataMap, msg /* String */) {
   alert(msg);
   portalDataMap.cancelMapping();
};

