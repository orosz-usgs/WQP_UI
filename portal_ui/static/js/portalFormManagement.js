/*jslint browser: true*/
/*global $*/

var PORTAL = PORTAL || {};


PORTAL.getHeadRequest = function(resultType) {
	var deferred = $.Deferred();
	var url = APP.URLS.getFormUrl(resultType);
	
	if (url.length > 2000) {
		deferred.resolve('Too many query criteria selected.  <br>Please reduce your selections <br>' +
                    'NOTE: selecting all options for a given criteria is the same as selecting none.<br>' +
                    'query length threshold 2000, current length: ' + url.length);
	}
	$.ajax({
		url : url,
		method: 'HEAD',
		success : function(data, textStatus, jqXHR) {
			deferred.resolve(jqXHR);
		},
		error : function(jqXHR, textStatus) {
			deferred.resolve('Unable to contact the WQP services: ' + textStatus);
		}
	});
	return deferred.promise();
};

var APP = {};

// ================
// URL Construction
// ================
APP.URLS = {};

APP.URLS = {
    
    getQueryParams : function(forGoogle /* Boolean */) {
        var IGNORE_PARAM_LIST = ["north","south","east","west","resultType","source", "nawqa_project", "project_code"];

        var ignoreList = (forGoogle)? IGNORE_PARAM_LIST.concat(["mimeType","zip"]): IGNORE_PARAM_LIST;
        var result = getFormQuery($('#params'), ignoreList);

        if (forGoogle) {
            if (!result){
                result += '&';
            }
            result += "mimeType=kml";
        }

        return result;
    },
    getFormUrl: function(resultType /* string */, forGoogle /* boolean */) {
        // Return the url for the page's form for the result type,resultType.
        // The returned url is different if it is sent to google maps.
        return Config.QUERY_URLS[resultType] + "?" + APP.URLS.getQueryParams(forGoogle); // remove the first '&' in the query string
    }
};



