describe('Test SiteImportWPSUtils', function () {
    describe('Test getRequestXML', function () {
        it('Expects properly formatted WPS XML payload', function () {
            // For whatever reason, I could not get jquery or standard javascript commands to properly
            // parse the XML document. I'm doing a complete compare which will probably be subject to changes in
            // OpenLayers. Be aware.
            var dataInputs = [{name: 'statecode', value: 'US:55'},
                {name: 'siteType', value: 'Well'},
                {name: 'testparm', value: 'P1'},
                {name: 'testparm', value: 'P2'},
                {name: 'providers', value: ['NWIS', 'STEWARDS']}];
            var result = SiteImportWPSUtils.getRequestXML('gs:SiteImport', dataInputs);
            var EXPECTED_RESULT =
                '<wps:DataInputs><wps:Input><ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">statecode</ows:Identifier><wps:Data><wps:LiteralData>US:55</wps:LiteralData></wps:Data></wps:Input>' +
                '<wps:Input><ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">siteType</ows:Identifier><wps:Data><wps:LiteralData>Well</wps:LiteralData></wps:Data></wps:Input>' +
                '<wps:Input><ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">testparm</ows:Identifier><wps:Data><wps:LiteralData>P1</wps:LiteralData></wps:Data></wps:Input>' +
                '<wps:Input><ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">testparm</ows:Identifier><wps:Data><wps:LiteralData>P2</wps:LiteralData></wps:Data></wps:Input>' +
                '<wps:Input><ows:Identifier xmlns:ows="http://www.opengis.net/ows/1.1">providers</ows:Identifier><wps:Data><wps:LiteralData>NWIS,STEWARDS</wps:LiteralData></wps:Data></wps:Input>' +
                '</wps:DataInputs>';

            expect(result).toMatch(EXPECTED_RESULT);

        });
    });
});


