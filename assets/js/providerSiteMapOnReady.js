import addOverlays from './nldiMapping';


$(document).ready(function() {
    var site = Config.site;
    var latitude = site.LatitudeMeasure;
    var longitude = site.LongitudeMeasure;
    var map = window.SITE.siteMap(latitude, longitude, {mapDivId : 'sites_map', mapZoom: 10});
    addOverlays(map);
});
