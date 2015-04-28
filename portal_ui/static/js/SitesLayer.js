var WQP = WQP || {};

(function() {
	var getWQPSLD = $.Deferred();
	var wqpSLD = '';
		
	$.ajax({
		url : Config.STATIC_ENDPOINT + 'sld/wqp_sites.sld',
		dataType : 'text',
		success : function(data) {
			getWQPSLD.resolve(data);
		},
		error : function(jqXHR, textStatus) {
			console.log('Can\'t read wqp_sites.sld');
			getWQPSLD.resolve('');
		}
	});

	getWQPSLD.done(function(sldBody) {
		wqpSLD = sldBody;
	});


	/*
	 * Provides methods to create a site layer and to add an id control
	 * @param {Array of {Object - with name and value properties} formParams
	 * @param {Function} loadendCallback - to be called when loadend event is triggered.
	 * @param {Boolean} enableBoxId
	 * @param {Function} selectFeatureFnc - function to execute when selecting features on the layer
	 * @returns {Object}
	 */
	
	WQP.SitesLayer = function (formParams,
						loadendCallback,
						enableBoxId,
	                    selectFeatureFnc) {
	    this._isBoxIDEnabled = enableBoxId;
	    this._selectFeatureFnc = selectFeatureFnc;
	    
	    var getSearchParams = function(formParams) {
	    	var result = [];
	    	providerValues = [];
	    	$.each(formParams, function(index, param) {
	    		if (param.name === 'providers') {
	    			providerValues.push(param.value);
	    		}
	    		else {
	    			var paramStr = param.name + ':' + param.value.replace(';', '|');
	    			result.push(paramStr);
	    		}
	    	});
	    	if (providerValues.length > 0) {
	    		result.push('providers:' + providerValues.join('|'));
	    	}
	    	return result.join(';');   	
	    };
	    
	    this.searchParams = getSearchParams(formParams);
	
	    this.dataLayer = new OpenLayers.Layer.WMS(
	            'Sites',
	            Config.SITES_GEOSERVER_ENDPOINT + 'wms',
	            {
	                layers: 'wqp_sites',
	                styles : 'wqp_sources', 
	                format: 'image/png',
	                transparent: true,
	                searchParams : this.searchParams
	            },
	            {
	                displayInLayerSwitcher: false,
	                isBaseLayer: false,
	                transitionEffect: 'resize',
	                singleTile: true,
	                visibility: true,
	                opacity: 0.75,
	                tileOptions: {
						// http://www.faqs.org/rfcs/rfc2616.html
						// This will cause any request larger than this many characters to be a POST
						maxGetUrlLength: 1024
					}
	                
	            }
	    );
	    this.dataLayer.events.register('loadend', this, function(ev) {
	    	loadendCallback();
	    });
	
	    this._createIdControl = function() {
	    	var filter = new OpenLayers.Filter.Comparison({
	    		type : OpenLayers.Filter.Comparison.EQUAL_TO,
	    		property : 'searchParams',
	    		value : encodeURIComponent(this.searchParams)
	    	});
	    	var protocol = new OpenLayers.Protocol.WFS({
	    		version: '1.1.0',
	    		url : Config.SITES_GEOSERVER_ENDPOINT + 'wfs',
	    		srsName : 'EPSG:900913',
	    		featureType : 'wqp_sites',
	    		featurePrefix: '',
	    		defaultFilter : filter
	    	});
	    	    	
	    	//var protocol = OpenLayers.Protocol.WFS.fromWMSLayer(this.dataLayer);
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
	        this.idFeatureControl.events.register('clickout', this, function(ev) {
	        	console.log('No feature selected');
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

}());