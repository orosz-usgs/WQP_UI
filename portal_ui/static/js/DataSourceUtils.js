var DataSourceUtils = {
    getCountsFromHeader : function(headers /* HTTP Header object */, dataSources /*array of providers*/) {
        /*
         * Return an object which contains the dataSources counts contained in headers. The returned
         * object has keys for each source id in dataSources plus a key for total counts. Each one of
         * these key's value is an object containing the formatted count string for sites and results.
         */
        function formatCount(key) {
           // Return the first value of the key from the headers. If the key
           // is not in the header return 0.
           var countHeader = headers.get(key);

           if (countHeader.length > 0 && countHeader[0].value !== '0'){
               return $.formatNumber(countHeader[0].value, {format:'#,###', locale: 'us'});
           }
           else {
               return '0';
           }
        }

        var result = {};
        for (var i = 0; i < dataSources.length; i++) {
            var id = dataSources[i];
            result[id] = {
                sites: formatCount(id + '-Site-Count'),
                results: formatCount(id + '-Result-Count')
            };
        }
        result.total = {
            sites: formatCount('Total-Site-Count'),
            results: formatCount('Total-Result-Count')
        };

        return result;
    }
};
