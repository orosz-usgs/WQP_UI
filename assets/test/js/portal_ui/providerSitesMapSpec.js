describe('Tests for SITES.sitesMap', function() {
    var mapDiv;
    var $testDiv;
    var addLayerSpy, setViewSpy, fitBoundsSpy, basemapAddToSpy, markersAddLayerSpy;

    beforeEach(function() {
        Config.siteData = {'type': 'FeatureCollection', 'features': [{'geometry': {'type': 'Point', 'coordinates': [-103.9118762, 42.845245]}, 'type': 'Feature', 'properties': {'MonitoringLocationName': 'WARBONNET CREEK NEAR HARRISON, NEBR.', 'siteUrl': 'http://www.waterqualitydata.us/provider/NWIS/USGS-NE/USGS-06396490/', 'MonitoringLocationTypeName': 'Stream', 'ProviderName': 'NWIS', 'activityCount': '0', 'HUCEightDigitCode': '10120108', 'ResolvedMonitoringLocationTypeName': 'Stream', 'OrganizationFormalName': 'USGS Nebraska Water Science Center', 'OrganizationIdentifier': 'USGS-NE', 'resultCount': '0', 'MonitoringLocationIdentifier': 'USGS-06396490'}}, {'geometry': {'type': 'Point', 'coordinates': [-103.6865936, 42.9727453]}, 'type': 'Feature', 'properties': {'MonitoringLocationName': 'HAT CR AT GEISER RANCH NR ARDMORE, S. DAK (NEB)', 'siteUrl': 'http://www.waterqualitydata.us/provider/NWIS/USGS-NE/USGS-06397700/', 'MonitoringLocationTypeName': 'Stream', 'ProviderName': 'NWIS', 'activityCount': '0', 'HUCEightDigitCode': '10120108', 'ResolvedMonitoringLocationTypeName': 'Stream', 'OrganizationFormalName': 'USGS Nebraska Water Science Center', 'OrganizationIdentifier': 'USGS-NE', 'resultCount': '0', 'MonitoringLocationIdentifier': 'USGS-06397700'}}, {'geometry': {'type': 'Point', 'coordinates': [-103.6529865, 42.6196881]}, 'type': 'Feature', 'properties': {'MonitoringLocationName': 'WHITE RIVER TRIBUTARY N GLEN, NEBR.', 'siteUrl': 'http://www.waterqualitydata.us/provider/NWIS/USGS-NE/USGS-06443200/', 'MonitoringLocationTypeName': 'Stream', 'ProviderName': 'NWIS', 'activityCount': '0', 'HUCEightDigitCode': '10140201', 'ResolvedMonitoringLocationTypeName': 'Stream', 'OrganizationFormalName': 'USGS Nebraska Water Science Center', 'OrganizationIdentifier': 'USGS-NE', 'resultCount': '0', 'MonitoringLocationIdentifier': 'USGS-06443200'}}, {'geometry': {'type': 'Point', 'coordinates': [-103.5565958, 42.6102442]}, 'type': 'Feature', 'properties': {'MonitoringLocationName': 'DEEP CREEK NEAR GLEN, NEBR', 'siteUrl': 'http://www.waterqualitydata.us/provider/NWIS/USGS-NE/USGS-06443300/', 'MonitoringLocationTypeName': 'Stream', 'ProviderName': 'NWIS', 'activityCount': '0', 'HUCEightDigitCode': '10140201', 'ResolvedMonitoringLocationTypeName': 'Stream', 'OrganizationFormalName': 'USGS Nebraska Water Science Center', 'OrganizationIdentifier': 'USGS-NE', 'resultCount': '0', 'MonitoringLocationIdentifier': 'USGS-06443300'}}, {'geometry': {'type': 'Point', 'coordinates': [-103.5363156, 42.6883009]}, 'type': 'Feature', 'properties': {'MonitoringLocationName': 'SOLDIERS CREEK NEAR CRAWFORD, NEBR.', 'siteUrl': 'http://www.waterqualitydata.us/provider/NWIS/USGS-NE/USGS-06443700/', 'MonitoringLocationTypeName': 'Stream', 'ProviderName': 'NWIS', 'activityCount': '0', 'HUCEightDigitCode': '10140201', 'ResolvedMonitoringLocationTypeName': 'Stream', 'OrganizationFormalName': 'USGS Nebraska Water Science Center', 'OrganizationIdentifier': 'USGS-NE', 'resultCount': '0', 'MonitoringLocationIdentifier': 'USGS-06443700'}}]};
        Config.localBaseUrl = 'http://fake.url.gov';
        $('body').prepend('<div id="test-div"><div id="map-div"></div></div>');
        $testDiv = $('#test-div');
        mapDiv = 'map-div';
        setViewSpy = jasmine.createSpy('setView');
        addLayerSpy = jasmine.createSpy('addLayer');
        fitBoundsSpy = jasmine.createSpy('fitBounds');
        basemapAddToSpy = jasmine.createSpy('basemapAddTo');
        markersAddLayerSpy = jasmine.createSpy('markersAddLayer');
        spyOn(L, 'map').and.returnValue({
            addLayer : addLayerSpy,
            setView : setViewSpy,
            fitBounds : fitBoundsSpy
        });
        spyOn(L.tileLayer, 'provider').and.returnValue({
            addTo : basemapAddToSpy
        });
        spyOn(L, 'markerClusterGroup').and.returnValue({
            addLayer : markersAddLayerSpy
        });
        SITES.sitesMap({mapDivId : mapDiv});
    });

    afterEach(function() {
        $testDiv.remove();
    });

    it('Expects map is properly created.', function() {
        expect(L.map).toHaveBeenCalled();
        expect(setViewSpy).toHaveBeenCalled();
    });

    it('Expects sites to be grouped into clusters.', function() {
        expect(L.markerClusterGroup).toHaveBeenCalledWith({chunkedLoading: true, spiderfyDistanceMultiplier: 3});
    });
});
