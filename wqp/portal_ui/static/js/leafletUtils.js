/* jslint browser: true */

/* global L */

L.Util.getIntersection = function(bounds1, bounds2) {
	"use strict";
	var result;
	var south1, north1, west1, east1;
	var south2, north2, west2, east2;
	var south, north, west, east;

	if (bounds1.intersects(bounds2)) {
		south1 = bounds1.getSouth();
		north1 = bounds1.getNorth();
		west1 = bounds1.getWest();
		east1 = bounds1.getEast();

		south2 = bounds2.getSouth();
		north2 = bounds2.getNorth();
		west2 = bounds2.getWest();
		east2 = bounds2.getEast();

		south = south1 < south2 ? south2 : south1;
		north = north1 < north2 ? north1 : north2;
		west = west1 < west2 ? west2 : west1;
		east = east1 < east2 ? east1 : east2;

		result = L.latLngBounds(L.latLng(south, west), L.latLng(north, east));
	}

	return result;
};