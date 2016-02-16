/* jslint browser: true */
/* global ol */

var PORTAL = PORTAL || {};
PORTAL.MAP = PORTAL.MAP || {};

PORTAL.MAP.BoxIdentifyControl = function(opt_options) {
	"use strict";
	var self = this;
	var options = opt_options || {};
	var element = document.createElement('div');
	var button = document.createElement('button');

	var toggleDrawBoxInteraction = function(e) {
		if (button.className.search('box-identify-on') !== -1) {
			button.className = button.className.replace('box-identify-on', 'box-identify-off');
			self.map_.removeInteraction(options.boxDrawInteraction);
		}
		else {
			button.className = button.className.replace('box-identify-off', 'box-identify-on');
			self.map_.addInteraction(options.boxDrawInteraction);
		}
	};
	element.className = 'box-identify';
	button.type = 'button';
	button.className = 'box-identify-off';
	element.appendChild(button);

	button.addEventListener('click', toggleDrawBoxInteraction);

	ol.control.Control.call(this, {
		element: element,
		target : options.target
	});
};

ol.inherits(PORTAL.MAP.BoxIdentifyControl, ol.control.Control);