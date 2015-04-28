describe ("Tests SitesLayer", function(){
    
    var map;
    
    var selectSpy, loadendSpy;
    var formParams = [
                      {name: 'param1', value: 'value1'},
                      {name : 'param2', value: 'valu2'}
    ];

    beforeEach(function() {
        $('body').append('<div id="map-div"></div>');
        
        map = new OpenLayers.Map('map-div');  
        
        selectSpy = jasmine.createSpy('selectSpy');
        loadendSpy = jasmine.createSpy('loadendSpy');
        
        Config = {
            SITES_GEOSERVER_ENDPOINT: 'http://faketestserver.com'
        };
    });
    
    afterEach(function() {
        $('#map-div').remove();
    });
    
    it('Expects layer and control object created', function() {
        var layer = new SitesLayer(formParams, loadendSpy, false, selectSpy);
        expect(layer.dataLayer).toBeDefined();
        expect(layer.idFeatureControl).toBeDefined();
        expect(layer.dataLayer.params.LAYERS).toEqual('wqp_sites');
    });
    
    it('Expects addToMap to add the layer and the control with the control set to use box to the map', function() {
        var layer = new SitesLayer(formParams, loadendSpy, true, selectSpy);
        layer.addToMap(map);
        
        expect(map.layers).toContain(layer.dataLayer);
        expect(map.controls).toContain(layer.idFeatureControl);
        expect(layer.idFeatureControl.box).toBe(true);
        expect(layer.idFeatureControl.click).toBe(false);

        expect(layer.idFeatureControl.active).toEqual(true);
    });
    
    it('Expects addToMap to add the layer and the control with the control set to use click to the map', function() {
        var layer = new SitesLayer(formParams, loadendSpy, false, selectSpy);
        layer.addToMap(map);
        
        expect(map.layers).toContain(layer.dataLayer);
        expect(map.controls).toContain(layer.idFeatureControl);
        expect(layer.idFeatureControl.box).toBe(false);
        expect(layer.idFeatureControl.click).toBe(true);

        expect(layer.idFeatureControl.active).toEqual(true);
    });
    
    it('Expects removeFromMap to remove the layer and the control from the map', function() {
         var layer = new SitesLayer(formParams, loadendSpy, true, selectSpy);
         layer.addToMap(map);
         
         layer.removeFromMap(map);
         expect(map.layers).not.toContain(layer.dataLayer);
         expect(map.controls).not.toContain(layer.idFeatureControl);
         expect(layer.idFeatureControl.active).toEqual(false);
    });
    
    it('Expects enableBoxId to set the click and box attributes appropriately', function() {
        var layer = new SitesLayer(formParams, loadendSpy, true, selectSpy);
        layer.addToMap(map);
        
        layer.enableBoxId(map, false);
        expect(layer.idFeatureControl.box).toBe(false);
        expect(layer.idFeatureControl.click).toBe(true);
        
        layer.enableBoxId(map, true);
        expect(layer.idFeatureControl.box).toBe(true);
        expect(layer.idFeatureControl.click).toBe(false);
    });
    
});