/* jslint browser: true */
/* global $ */
/* global SITE */
/* global NLDI */

$(document).ready(function() {
	var site = Config.site;
	var latitude = site.LatitudeMeasure;
	var longitude = site.LongitudeMeasure;
	var map = SITE.siteMap(latitude, longitude, {mapDivId : 'sites_map', mapZoom: 10});
	NLDI.addOverlays(map);
});