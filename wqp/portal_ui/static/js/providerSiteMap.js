/* jslint browser: true */
/* global L */
/* global Handlebars */
/* global _ */
/* global $ */

//This example uses leaflet to render maps.  Learn more about leaflet at http://leafletjs.com/
var map = L.map('sites_map');
// leaflet providers is a simple way to add a variety of free basemaps to a map.
// learn more here: https://github.com/leaflet-extras/leaflet-providers
var basemapTiles = L.tileLayer.provider('Esri.WorldGrayCanvas');
basemapTiles.addTo(map);
L.esri.tiledMapLayer({
url: "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
}).addTo(map);
L.tileLayer.wms('https://cida.usgs.gov/nwc/geoserver/gwc/service/wms',
	{
		layers : 'nhdplus:nhdflowline_network',
		format : 'image/png',
		transparent : true,
		opacity : 0.5
	}
).addTo(map);


map.setView([{{ site['LatitudeMeasure'] }} , {{ site['LongitudeMeasure'] }}], 10);

var all_extents = {
                "features": [],
                "properties": {
					"title": "all wqp extents"
                },
                "type": "FeatureCollection"
            };

var geojsonWqpMarkerOptions = {
radius: 4,
fillColor: "#ff7800",
color: "#000",
weight: 1,
opacity: 1,
fillOpacity: 0.8
};

var geojsonThisSiteMarkerOptions = {
radius: 25,
fillColor: "#35ECFF",
color: "#000",
weight: 1,
opacity: 1,
fillOpacity: 0.8
};

var downstreamLineStyle = {
"color": "#41b6c4",
"weight": 5,
"opacity": 0.65
};

var upstreamLineStyle = {
"color": "#253494",
"weight": 5,
"opacity": 0.65,
"dashArray": '15,8',
"lineJoin": 'square'
};

function addPointDataToMap(data, map, markerOptions) {
    var markers = L.markerClusterGroup({chunkedLoading:true, spiderfyDistanceMultiplier:3, maxClusterRadius:15});
    var pointLayer = L.geoJson(data, {
    onEachFeature: onEachPointFeature,
    pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, markerOptions);
    }
    });
    markers.addLayer(pointLayer);
    map.addLayer(markers);
}

function onEachPointFeature(feature, layer) {
        var parser = document.createElement('a');
        parser.href =  feature.properties.uri;
        var popupText = "Data Source: " + feature.properties.source
            + "<br>Data Source Name: " + feature.properties.sourceName
            + "<br>Station Name: " + feature.properties.name
            + "<br>Station ID: " + feature.properties.identifier
            + "<br>More Station Data: " + '<a href="{{ config.LOCAL_BASE_URL }}'+parser.pathname+'">Go to site page</a>';
        layer.bindPopup(popupText);
        }

function onEachLineFeature(feature, layer) {
        var popupText = "Data Source: NHD+"
            + "<br>Reach ComID: " + feature.properties.nhdplus_comid;
        layer.bindPopup(popupText);
        }

function addLineDataToMap(data, map, style) {

    var lineLayer = L.geoJson(data, {
        onEachFeature: onEachLineFeature,
        style: style
        });
    lineLayer.addTo(map);


     for (feature in data.features ) {
         all_extents.features.push(data.features[feature]);
     }
    map.fitBounds(L.geoJson(all_extents).getBounds());
}


var nldiURL = "{{ config.NLDI_SERVICES_ENDPOINT }}";
var f = 'wqp';
var e='UT';
var g = 'DM';
var c='{{ site['MonitoringLocationIdentifier'] }}';
var d='16.1';
var wqpURL_UT = nldiURL+f+"/"+c+"/navigate/"+e+"/wqp";
var wqpURL_DM = nldiURL+f+"/"+c+"/navigate/"+g+"/wqp";
var nhdURL_UT = nldiURL+f+"/"+c+"/navigate/"+e;
var nhdURL_DM = nldiURL+f+"/"+c+"/navigate/"+g;
var wqpURL_Site = nldiURL+f+"/"+c+"/";
console.log(d);
console.log(wqpURL_DM);
//$.get(wqpURL, {}, function(data) { addPointDataToMap(data, map); };);
console.log("getting sites upstream");
$.getJSON( wqpURL_Site,{}, function(data) { addPointDataToMap(data, map, geojsonThisSiteMarkerOptions);
                                            var coord = data.features[0].geometry.coordinates;
                                            var lalo = L.GeoJSON.coordsToLatLng(coord);
                                            map.setView(lalo, 10);
                                            });

$.getJSON( wqpURL_UT, {distance:d}, function(data) { addPointDataToMap(data, map, geojsonWqpMarkerOptions); });
console.log("sites added, getting streams upstream");
$.getJSON( nhdURL_UT, {distance:d}, function(data) { addLineDataToMap(data, map, upstreamLineStyle); });
console.log("getting sites downstream");
$.getJSON( wqpURL_DM, {distance:d}, function(data) { addPointDataToMap(data, map, geojsonWqpMarkerOptions); });
console.log("sites added, getting streams downstream");
$.getJSON( nhdURL_DM, {distance:d}, function(data) { addLineDataToMap(data, map, downstreamLineStyle); });