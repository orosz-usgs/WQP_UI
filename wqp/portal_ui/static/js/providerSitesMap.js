/* jslint browser: true */
/* global L */
/* global Handlebars */
/* global Config */
/* global _ */
/* global $ */

//This example uses leaflet to render maps.  Learn more about leaflet at http://leafletjs.com/
var map = L.map('sites_map');
// leaflet providers is a simple way to add a variety of free basemaps to a map.
// learn more here: https://github.com/leaflet-extras/leaflet-providers
var basemapTiles = L.tileLayer.provider('Esri.WorldTopoMap');
basemapTiles.addTo(map);
map.setView([35.9908385, -78.9005222], 3);


//function to return a color based on a value associated with each feature.
// We can then set a different color for each marker based on a characteristic of the
// marker- in this case, the type of site.
// While there is a handy leaflet var called geojsonMarkerOptions
// that lets you set the marker style for a leaflet geoJSON layer, it only works if you want every marker to be exactly the same
function getValue(x) {
	return x == "Stream" ? "#800026" :
		   x == "Well" ? "#FEB24C" :
		   x == "Land" ? "#E31A1C" :
		   x == "Estuary" ? "#FC4E2A" :
		   x == "Facility" ? "#FD8D3C" :
		   x == "Glacier"? "#BD0026" :
		   x == "Lake, Reservoir, Impoundment" ? "#FED976" :
			   "#FFEDA0";
}



//set the popup text for each feature, based on the geojson properties of each feature.
//The text is rendered as html and style with CSS3, so you can do pretty much anything to want in here-
//this example is a very simple list.
function setPopupValue(feature, layer) {
			var localBaseUrl = window.location.href;
			console.log(localBaseUrl);
			console.log(Config.localBaseUrl);
			var popupText = "Organization Name: " + feature.properties.OrganizationFormalName
				+ "<br>Station Name: " + feature.properties.MonitoringLocationName
				+ "<br>Station ID: " + feature.properties.MonitoringLocationIdentifier
				+ "<br>Station Type: " + feature.properties.ResolvedMonitoringLocationTypeName
				+'<br>Station Details:  <a href="' + 'http://127.0.0.1:5050' + feature.properties.MonitoringLocationIdentifier + '/">Go to station page.</a>';
			layer.bindPopup(popupText);
			}


// actually adding the data to the map.
//learn more about this here:
function addDataToMap(data, map) {
	console.log("Adding data to map");
	var markers = L.markerClusterGroup({chunkedLoading:true, spiderfyDistanceMultiplier:3});
	var dataLayer = L.geoJson(data, {
		onEachFeature: setPopupValue,
		pointToLayer: function (feature, latlng) {
		//here we are using the built-in circleMarker.  If we want to do more, we can make fancier icons
		return L.circleMarker(latlng, {
					radius: 5,
					fillColor: getValue(feature.properties.ResolvedMonitoringLocationTypeName),
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.7
				});
		}
		});
	markers.addLayer(dataLayer);
	map.addLayer(markers);
	map.fitBounds(L.geoJson(data).getBounds());
}

var siteData = Config.siteData;
addDataToMap(siteData, map);