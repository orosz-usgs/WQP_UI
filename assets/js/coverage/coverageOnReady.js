import log from 'loglevel';

import CoverageMap from './coverageMap';


$(document).ready(function() {
    // Set the loglevel
    if (Config.DEBUG) {
        log.setLevel('debug', false);
    } else {
        log.setLevel('warn', false);
    }

    var getLayerParams = function() {
        return {
            displayBy : $('input[name="displayBy"]:checked').val(),
            timeSpan: $('input[name="timeSpan"]:checked').val(),
            dataSource : $('input[name="dataSource"]:checked').val()
        };
    };

    var map = new CoverageMap({
        mapDivId: 'coverage-map-area',
        $loadingIndicator : $('.map-loading-indicator'),
        $legendImg: $('#legend-img'),
        layerParams : getLayerParams()
    });

    $('#display-options-body input').change(function() {
        map.updateDataLayer(getLayerParams());
    });
});
