var PORTAL = PORTAL || {};


PORTAL.DataSourceUtils = (function() {
	"use strict";
	
	var that = {};
	
	/*
	 * @param {jqXHR} xhr - from an ajax call
	 * @param {Array of String} dataSources - the array of providers for which we expect count headers.
	 * @return {Object} - properties for each dataSource and for the title. Each property value is 
	 *    itself an Object with properties for sites and results containing the counts. All counts
	 *    are strings.
	 */
    that.getCountsFromHeader = function(xhr, dataSources ) {
		
		// Return the first value of the key from the headers. If the key
		// is not in the header return 0.
		var formatCount = function(key) {           
			var countHeader = xhr.getResponseHeader(key);
		
			if (countHeader && countHeader !== '0'){
				return $.formatNumber(countHeader, {format:'#,###', locale: 'us'});
			}
			else {
				return '0';
			}
		};
		
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
    };
	
	return that;
}());
