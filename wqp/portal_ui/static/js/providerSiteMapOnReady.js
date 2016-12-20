/* jslint browser: true */
/* global $ */
/* global SITE */
/* global NLDI */

$(document).ready(function() {
	var map = SITE.siteMap({mapDivId : 'sites_map'});
	NLDI.overlays(map);
});