/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global $ */
/* global SITE */
/* global L */


fdescribe ('Tests for SITE.siteMap', function() {
	var mapDiv;
	var addLayerSpy, setViewSpy;

	beforeEach(function() {
		$('body').append('<div id=test-div><div id="map-div"></div></div>');
		mapDiv = 'map-div';
		addLayerSpy = jasmine.createSpy('addLayer');
		setViewSpy = jasmine.createSpy('setView');
		spyOn(L, 'map').and.returnValue({
			addLayer : addLayerSpy,
			setView : setViewSpy
		})
		SITE.siteMap({mapDivId : mapDiv});
	});
});