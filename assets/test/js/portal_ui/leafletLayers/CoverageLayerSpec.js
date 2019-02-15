import  '../../../../js/leafletLayers/CoverageLayer'; // Needed in order to include in the bundle for the test

describe('L.CoverageLayer', function() {
    var testLayer;

    describe('Tests for creating a layer', function() {

        var layerParams;

        beforeEach(function() {
            layerParams = {
                displayBy : 'states',
                timeSpan : 'all_time',
                dataSource : 'all'
            };
            spyOn(L.TileLayer.WMS.prototype, 'initialize').and.callThrough();
        });

        it('Expects that the layer created is an extension of L.TileLayer.WMS', function() {
            L.coverageLayer(layerParams, {});

            expect(L.TileLayer.WMS.prototype.initialize).toHaveBeenCalled();
        });

        it('Expects that the layer name changes with the displayBy parameter', function() {
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.layers).toEqual('qw_portal_map:states_all');

            layerParams.displayBy = 'counties';
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.layers).toEqual('qw_portal_map:counties_all');

            layerParams.displayBy = 'huc8';
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.layers).toEqual('qw_portal_map:huc8_all');
        });

        it('Expects that the viewparams changes with changes to layerParams', function() {
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('source1:E;source2:N');
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('timeFrame:all_time');

            layerParams.timeSpan = 'past_12_months';
            layerParams.dataSource = 'storet';
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('source1:E;source2:E');
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('timeFrame:past_12_months');

            layerParams.timeSpan = 'past_60_months';
            layerParams.dataSource = 'nwis';
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('source1:N;source2:N');
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('timeFrame:past_60_months');
        });

        it('Expects that the sld url changes with changes to layerParams', function() {
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.sld).toContain('http://fakesldendpoint');
            expect(testLayer.wmsParams.sld).toContain('dataSource=A');
            expect(testLayer.wmsParams.sld).toContain('geometry=S');
            expect(testLayer.wmsParams.sld).toContain('timeFrame=A');

            layerParams = {
                displayBy : 'counties',
                timeSpan : 'past_12_months',
                dataSource : 'storet'
            };
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.sld).toContain('dataSource=E');
            expect(testLayer.wmsParams.sld).toContain('geometry=C');
            expect(testLayer.wmsParams.sld).toContain('timeFrame=1');

            layerParams = {
                displayBy : 'huc8',
                timeSpan : 'past_60_months',
                dataSource : 'nwis'
            };
            testLayer = L.coverageLayer(layerParams, {});
            expect(testLayer.wmsParams.sld).toContain('dataSource=N');
            expect(testLayer.wmsParams.sld).toContain('geometry=H');
            expect(testLayer.wmsParams.sld).toContain('timeFrame=5');
        });

        it('Expects that the options are passed to the tilelayer initialize function', function() {
            testLayer = L.coverageLayer(layerParams, {zIndex : 1});

            expect(L.TileLayer.WMS.prototype.initialize).toHaveBeenCalledWith('http://faketestserver.com/wms',
                {zIndex : 1});
        });
    });

    describe('Tests for updateLayerParams', function() {
        var layerParams;

        beforeEach(function() {
            layerParams = {
                displayBy: 'states',
                timeSpan: 'all_time',
                dataSource: 'all'
            };

            testLayer = L.coverageLayer(layerParams, {});
        });

        it('Expects updates to layerParams to update the layerName', function() {
            layerParams.displayBy = 'counties';
            testLayer.updateLayerParams(layerParams);
            expect(testLayer.wmsParams.layers).toEqual('qw_portal_map:counties_all');

            layerParams.displayBy = 'huc8';
            testLayer.updateLayerParams(layerParams);
            expect(testLayer.wmsParams.layers).toEqual('qw_portal_map:huc8_all');
        });

        it('Expects updates to layerParams to update the VIEWPARAMS', function() {
            layerParams.timeSpan = 'past_12_months';
            layerParams.dataSource = 'storet';
            testLayer.updateLayerParams(layerParams);
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('source1:E;source2:E');
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('timeFrame:past_12_months');

            layerParams.timeSpan = 'past_60_months';
            layerParams.dataSource = 'nwis';
            testLayer.updateLayerParams(layerParams);
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('source1:N;source2:N');
            expect(testLayer.wmsParams.VIEWPARAMS).toContain('timeFrame:past_60_months');
        });

        it('Expects updates to layerParams to update the sld endpoint', function() {
            layerParams = {
                displayBy : 'counties',
                timeSpan : 'past_12_months',
                dataSource : 'storet'
            };
            testLayer.updateLayerParams(layerParams);
            expect(testLayer.wmsParams.sld).toContain('dataSource=E');
            expect(testLayer.wmsParams.sld).toContain('geometry=C');
            expect(testLayer.wmsParams.sld).toContain('timeFrame=1');

            layerParams = {
                displayBy : 'huc8',
                timeSpan : 'past_60_months',
                dataSource : 'nwis'
            };
            testLayer.updateLayerParams(layerParams);
            expect(testLayer.wmsParams.sld).toContain('dataSource=N');
            expect(testLayer.wmsParams.sld).toContain('geometry=H');
            expect(testLayer.wmsParams.sld).toContain('timeFrame=5');
        });
    });

    describe('Tests for getLegendGraphicUrl', function() {
        var layerParams;
        beforeEach(function() {
            layerParams = {
                displayBy: 'states',
                timeSpan: 'all_time',
                dataSource: 'all'
            };

            testLayer = L.coverageLayer(layerParams, {});
        });


        it('Expects the url to go to the WQP MAP Geoserver endpoint', function() {
            expect(testLayer.getLegendGraphicURL()).toContain(Config.WQP_MAP_GEOSERVER_ENDPOINT);
        });

        it('Expects the url to be a GetLegendGraphic request', function() {
            expect(testLayer.getLegendGraphicURL()).toContain('request=GetLegendGraphic');
        });

        it('Expects the url to reflect the layerName, sld, and VIEWPARAMS that are sent', function() {
            var url = testLayer.getLegendGraphicURL();
            var sldIndex = url.search('sld');
            var sld = url.slice(sldIndex);
            var endSldIndex = sld.search('&');

            var viewIndex = url.search('VIEWPARAMS');
            var viewparams = url.slice(viewIndex);
            var endViewParamsIndex = viewparams.search('&');

            sld = endSldIndex > 0 ? sld.slice(0, endSldIndex) : sld;
            viewparams = endViewParamsIndex > 0 ? viewparams.slice(0, endViewParamsIndex) : viewparams;

            url = decodeURIComponent(url);
            sld = decodeURIComponent(sld);
            viewparams = decodeURIComponent(viewparams);

            expect(url).toContain('layer=qw_portal_map:states_all');
            expect(sld).toContain('http://fakesldendpoint');
            expect(sld).toContain('dataSource=A');
            expect(sld).toContain('geometry=S');
            expect(sld).toContain('timeFrame=A');

            expect(viewparams).toContain('source1:E;source2:N');
            expect(viewparams).toContain('timeFrame:all_time');
        });
    });

    describe('Tests for fetchFeatureAtLocation', function() {
        var layerParams;
        var latLng;
        beforeEach(function() {
            layerParams = {
                displayBy: 'states',
                timeSpan: 'all_time',
                dataSource: 'all'
            };

            latLng = L.latLng(43, -99);

            spyOn($, 'ajax');

            testLayer = L.coverageLayer(layerParams, {});
        });

        it('Expects that  a GetFeature request is made', function() {
            var ajaxOptions;
            testLayer.fetchFeatureAtLocation(latLng);

            expect($.ajax).toHaveBeenCalled();
            ajaxOptions = $.ajax.calls.argsFor(0)[0];
            expect(ajaxOptions.data.request).toEqual('GetFeature');
            expect(ajaxOptions.url).toContain(Config.WQP_MAP_GEOSERVER_ENDPOINT);
        });

        it('Expects that the typeNames is the layer\'s layers parameters', function() {
            testLayer.fetchFeatureAtLocation(latLng);

            expect($.ajax.calls.argsFor(0)[0].data.typeNames).toEqual(testLayer.wmsParams.layers);
        });

        it('Expects that the VIEWPARAMS is the layer\'s layers VIEWPARAMS', function() {
            testLayer.fetchFeatureAtLocation(latLng);

            expect($.ajax.calls.argsFor(0)[0].data.VIEWPARAMS).toEqual(testLayer.wmsParams.VIEWPARAMS);
        });

        it('Expects that the cqp_filter contains the latlng', function() {
            testLayer.fetchFeatureAtLocation(latLng);

            expect($.ajax.calls.argsFor(0)[0].data.cql_filter).toContain('43 -99');
        });
    });
});
