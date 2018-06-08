import siteMap from '../../../js/providerSiteMap';


describe ('Tests for providerSiteMap', function() {
    var mapDiv;
    var $testDiv;
    var setViewSpy, basemapAddSpy, hydroLayerAddToSpy, wmsAddToSpy;

    beforeEach(function() {
        Config.site = {LatitudeMeasure: 43.06, LongitudeMeasure: -89.4};
        Config.HYDRO_LAYER_ENDPOINT = 'http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer';
        Config.NHDPLUS_FLOWLINE_ENDPOINT = 'https://cida.usgs.gov/nwc/geoserver/gwc/service/wms';
        $('body').prepend('<div id="test-div"><div id="map-div"></div></div>');
        mapDiv = 'map-div';
        $testDiv = $('#test-div');
        setViewSpy = jasmine.createSpy('setView');
        basemapAddSpy = jasmine.createSpy('basemapAddTo');
        hydroLayerAddToSpy = jasmine.createSpy('hydroLayerAddTo');
        wmsAddToSpy = jasmine.createSpy('wmsAddTo');
        spyOn(L, 'map').and.returnValue({
            setView : setViewSpy
        });
        spyOn(L.tileLayer, 'provider').and.returnValue({
            addTo : basemapAddSpy
        });
        spyOn(L.esri, 'tiledMapLayer').and.returnValue({
            addTo: hydroLayerAddToSpy
        });
        spyOn(L.tileLayer, 'wms').and.returnValue({
            addTo: wmsAddToSpy
        });
        var latitude = Config.site.LatitudeMeasure;
        var longitude = Config.site.LongitudeMeasure;
        siteMap(latitude, longitude, {mapDivId : mapDiv, mapZoom : 10});
    });

    afterEach(function() {
        $testDiv.remove();
    });

    it('Expects map object to be created.', function() {
        expect(L.map).toHaveBeenCalled();
        expect(setViewSpy).toHaveBeenCalled();
    });

    it('Expect the tileLayer provider to be called and map added', function() {
        expect(L.tileLayer.provider).toHaveBeenCalledWith('Esri.WorldGrayCanvas');
        expect(basemapAddSpy).toHaveBeenCalled();
    });

    it('Expect the nhdHydroLayer to be called and map added', function() {
        expect(L.esri.tiledMapLayer).toHaveBeenCalledWith({ url : 'http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer'});
        expect(hydroLayerAddToSpy).toHaveBeenCalled();
    });

    it('Expect the nhdPlus layer to be retrieved and map added', function() {
        expect(L.tileLayer.wms).toHaveBeenCalledWith('https://cida.usgs.gov/nwc/geoserver/gwc/service/wms', jasmine.any(Object));
        expect(wmsAddToSpy).toHaveBeenCalled();
    });
});
