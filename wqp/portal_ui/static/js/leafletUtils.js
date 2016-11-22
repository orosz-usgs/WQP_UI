/* jslint browser: true */

var WQP = WQP || {};
WQP.L = WQP.L || {};
WQP.L.Util = WQP.L.Util || {};

WQP.L.Util.toBBoxString = function(bounds) {
	"use strict";
	return bounds.getSouth() + ',' + bounds.getWest() + ',' + bounds.getNorth() + ',' + bounds.getEast();
};