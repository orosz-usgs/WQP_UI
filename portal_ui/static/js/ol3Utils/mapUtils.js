/* jslint browser: true */
/* global ol */

var WQP = WQP || {};

WQP.ol3 = WQP.ol3 || {};

WQP.ol3.mapUtils = (function() {
	"use strict";

	var self = {};

	self.createXYZBaseLayer = function(layerInfo, isVisible) {
		return new ol.layer.Tile({
			title : layerInfo.name,
			type : 'base',
			visible : isVisible,
			source : new ol.source.XYZ({
				attributions : [
					new ol.Attribution({
						html : layerInfo.attribution
					})
				],
				url : layerInfo.url + '{z}/{y}/{x}'
			})
		});
	};

	return self;

})();