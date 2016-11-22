/* jslint browser: true */
/* global L */
/* global describe, it, expect */

describe('leafletUtils', function() {
	"use strict";

	describe('Tests for getIntersection', function() {

		it('Expects that if bounds1 is contained in bounds2 that the returned value is bounds1', function() {
			var bounds1 = L.latLngBounds(L.latLng(41, -99), L.latLng(42, -98));
			var bounds2 = L.latLngBounds(L.latLng(40, -100), L.latLng(43, -97));

			expect(L.Util.getIntersection(bounds1, bounds2)).toEqual(bounds1);
		});

		it('Expects that if bounds2 is contained in bounds1 that the returned value is bounds2', function() {
			var bounds2 = L.latLngBounds(L.latLng(41, -99), L.latLng(42, -98));
			var bounds1 = L.latLngBounds(L.latLng(40, -100), L.latLng(43, -97));

			expect(L.Util.getIntersection(bounds1, bounds2)).toEqual(bounds2);
		});

		it('Expects that if bounds1 and bounds 2 do not intersect return undefined', function() {
			var bounds1 = L.latLngBounds(L.latLng(41, -99), L.latLng(42, -98));
			var bounds2 = L.latLngBounds(L.latLng(43, -97), L.latLng(44, -96));

			expect(L.Util.getIntersection(bounds1, bounds2)).toBeUndefined();
		});

		it('Expects that if bounds1 and bounds2 intersect that this returns the intersecting bounds', function() {
			var bounds1 = L.latLngBounds(L.latLng(41, -99), L.latLng(43, -97));
			var bounds2 = L.latLngBounds(L.latLng(42, -98), L.latLng(44, -96));

			expect(L.Util.getIntersection(bounds1, bounds2)).toEqual(L.latLngBounds(L.latLng(42, -98), L.latLng(43, -97)));
		});
	});
});