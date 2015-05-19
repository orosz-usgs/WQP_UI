SiteImportWPSUtils = {
    getRequestXML : function(
        /* Return the request XML for a siteImport WPS function */
        identifier /* String identifying the WPS request */,
        dataInputs /* array of objects {'name' : xxx, 'value' : xxx}*/) {

        var formattedData = [];
        for (var i = 0; i < dataInputs.length; i++) {
            formattedData.push({'identifier' : dataInputs[i].name,
                                'data' : {'literalData' : {'value': dataInputs[i].value}}});
        }

        return new OpenLayers.Format.WPSExecute().write({
            'identifier' : identifier,
            'dataInputs' : formattedData,
            'responseForm' : { 'rawDataOutput' : { 'identifier': 'result' }}
        });
    }
}

