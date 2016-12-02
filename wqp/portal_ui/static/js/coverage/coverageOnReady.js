/* jslint browser: true */
/* global $ */
/* global COVERAGE */
/* global Config */
/* global log */

$(document).ready(function() {
	"use strict";
	// Set the loglevel
	if (Config.DEBUG) {
		log.setLevel('debug', false);
	}
	else {
		log.setLevel('warn', false);
	}

	var getLayerParams = function() {
		return {
			displayBy : $('input[name="displayBy"]:checked').val(),
			timeSpan: $('input[name="timeSpan"]:checked').val(),
			dataSource : $('input[name="dataSource"]:checked').val()
		};
	};

	var map = COVERAGE.coverageMap({
		mapDivId: 'coverage-map-area',
		$legendImg: $('#legend-img'),
		layerParams : getLayerParams()
	});

	$('#display-options-body input').change(function() {
		map.updateDataLayer(getLayerParams());
	});
});