/**
 * Add NLDI layer overlays to a leaflet map. An overlay is added for the flowlines
 * upstream and downstream of a site; another overlay is added to upstream and
 * downstream WQP sites. Pop-ups are created for each feature in the overlay
 * layers.
 *
 * @param {L.map} map The leaflet map that the overlay should be added to
 */
export const addOverlays = function(nldiMap) {
    var map = nldiMap;
    var nldiUrl = Config.NLDI_SERVICES_ENDPOINT;
    var site = Config.site;
    var WQP = 'wqp';
    var UT = 'UT';
    var DM = 'DM';
    var MONITORING_LOCATION_IDENTIFIER = site.MonitoringLocationIdentifier;
    var DISTANCE = '16.1'; // distance in kilometers
    var distanceParam = {distance : DISTANCE};

    var allExtents = {
        'features': [],
        'properties': {
            'title': 'all wqp extents'
        },
        'type': 'FeatureCollection'
    };

    var geojsonWqpMarkerOptions = {
        radius: 4,
        fillColor: '#ff7800',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var geojsonThisSiteMarkerOptions = {
        radius: 25,
        fillColor: '#35ECFF',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var downstreamLineStyle = {
        'color': '#41b6c4',
        'weight': 5,
        'opacity': 0.65
    };

    var upstreamLineStyle = {
        'color': '#253494',
        'weight': 5,
        'opacity': 0.65,
        'dashArray': '15,8',
        'lineJoin': 'square'
    };

    var onEachPointFeatureAddPopUp = function(feature, layer) {
        var uri = feature.properties.uri;
        var popupText = 'Data Source: ' + feature.properties.source +
            '<br>Data Source Name: ' + feature.properties.sourceName +
            '<br>Station Name: ' + feature.properties.name +
            '<br>Station ID: ' + feature.properties.identifier +
            '<br>More Station Data: ' + '<a href="' + uri + '">Go to site page</a>';
        layer.bindPopup(popupText);
    };

    var addPointDataToMap = function(data, markerOptions) {
        var markers = L.markerClusterGroup({chunkedLoading:true, spiderfyDistanceMultiplier:3, maxClusterRadius:15});
        var pointLayer = L.geoJson(data, {
            onEachFeature: onEachPointFeatureAddPopUp,
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, markerOptions);
            }
        });
        markers.addLayer(pointLayer);
        map.addLayer(markers);
    };

    var onEachLineFeatureAddPopUp = function(feature, layer) {
        var popupText = 'Data Source: NHD+' +
            '<br>Reach ComID: ' + feature.properties.nhdplus_comid;
        layer.bindPopup(popupText);
    };

    var addLineDataToMap = function(data, style) {
        var lineLayer = L.geoJson(data, {
            onEachFeature: onEachLineFeatureAddPopUp,
            style: style
            });
        lineLayer.addTo(map);
        var features = data.features;
        features.forEach(function(feature) {
            allExtents.features.push(feature);
        });
        map.fitBounds(L.geoJson(allExtents).getBounds());
    };

    var addNldiLinesToMap = function(endpointUrl, style) {
        $.getJSON(endpointUrl, distanceParam, function(data) {
            addLineDataToMap(data, style);
        });
    };

    var addNldiPointsToMap = function(endpointUrl, style) {
        $.getJSON(endpointUrl, distanceParam, function(data) {
            addPointDataToMap(data, style);
        });
    };

    var WQPURLUT = nldiUrl + WQP + '/' + MONITORING_LOCATION_IDENTIFIER + '/navigate/' + UT + '/wqp';
    var WQPURLDM = nldiUrl + WQP + '/' + MONITORING_LOCATION_IDENTIFIER + '/navigate/' + DM + '/wqp';
    var NHDURLUT = nldiUrl + WQP + '/' + MONITORING_LOCATION_IDENTIFIER + '/navigate/' + UT;
    var NHDURLDM = nldiUrl + WQP + '/' + MONITORING_LOCATION_IDENTIFIER + '/navigate/' + DM;
    var WQPURLSITE = nldiUrl + WQP + '/' + MONITORING_LOCATION_IDENTIFIER + '/';

    var nldiLines = [
        {url : NHDURLUT, style : upstreamLineStyle}, // upstream lines
        {url : NHDURLDM, style : downstreamLineStyle} // downstream lines
    ];

    var nldiPoints = [
        {url : WQPURLUT, style : geojsonWqpMarkerOptions}, // upstream sites
        {url : WQPURLDM, style : geojsonWqpMarkerOptions} // downstream sites
    ];

        // style the current site so it can be easily identified
    $.getJSON(WQPURLSITE, {}, function(data) {
        addPointDataToMap(data, geojsonThisSiteMarkerOptions);
        var coord = data.features[0].geometry.coordinates;
        var latlon = L.GeoJSON.coordsToLatLng(coord);
        map.setView(latlon, 10);
    });

    nldiLines.forEach(function(pair) {
        addNldiLinesToMap(pair.url, pair.style);
    });

    nldiPoints.forEach(function(pair) {
        addNldiPointsToMap(pair.url, pair.style);
    });
};
