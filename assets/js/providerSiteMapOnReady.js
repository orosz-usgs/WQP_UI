import { addOverlays } from './nldiMapping';
import siteMap from './providerSiteMap';


$(document).ready(function() {
    var site = Config.site;
    var latitude = site.LatitudeMeasure;
    var longitude = site.LongitudeMeasure;
    var map = siteMap(latitude, longitude, {mapDivId : 'site-map', mapZoom: 10});
    addOverlays(map);
});
