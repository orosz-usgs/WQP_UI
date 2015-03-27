var APP = {};


APP.DOWNLOAD = {
    beforeSubmit: function(myForm /* DOM element */, resultType){
        // Validate the form and if valid construct URL string, determine if
        // it is valid and make the head request if it is.

        var urlString = APP.URLS.getFormUrl(resultType);
        if (urlString.length > 2000){
            PORTAL.downloadProgressDialog.updateProgress({
                message : 'Too many query criteria selected.  <br>Please reduce your selections <br>'
                    + 'NOTE: selecting all options for a given criteria is the same as selecting none.<br>'
                    + 'query length threshold 2000, current length: ' + urlString.length
            });
        }
        APP.DOWNLOAD.makeHeadRequest(urlString, $('#providers-select').val(), resultType, $('input[name="mimeType"]').val());

        return;
    },

    makeHeadRequest: function(urlString /* url to send as HEAD request */, providers /* array of providers, if empty all providers*/, resultType, fileFormat){
        // Make headrequest and process the response, updating the progress dialog
        // as neeed.
        var http = new XMLHttpRequest();
        http.open('HEAD', urlString, false); //synchronous
        http.send();
        var headers = new HTTPHeaders(http.getAllResponseHeaders());
        var warnings = headers.getWarnings();

        // Object represents the counts returned in the header
        var count = DataSourceUtils.getCountsFromHeader(headers, PORTAL.MODELS.providers.getIds());

        var resultsReturned = resultType !== 'Station';

        var getCountMessage = function(){
            // Return a string showing the site counts, formatted to be shown in html.
            var message = 'Your query will return ';
            var providers = PORTAL.MODELS.providers.getIds();
            if (resultsReturned) {
                message += '<b>' + count.total.results + '</b> sample results from <b>' + count.total.sites + '</b> sites:<br />';
                for (var i = 0; i < providers.length; i++) {
                    var id = providers[i];
                    message += 'From ' + id + ': ' + count[id].results + ' sample results from ' + count[id].sites + ' sites<br />';
                }

            }
            else {
                message += count.total.sites + ':<br />';
                for (var i = 0; i < providers.length; i++) {
                    var id = providers[i];
                    message += 'From ' + id + ': ' + count[id].sites + '<br/>';
                }
            }
            return message;
        };

        function noData() {
            return (resultsReturned && (count.total.results === '0')) || (!resultsReturned && (count.total.sites === '0'));
        };

        // Process warnings in header. We are currently ignoring warnings with a code of 199.
        var warningMessage = '';
        for (var i=0; i < warnings.length; i++) {
            if (( $.inArray(warnings[i].agent, providers) !== -1) && warnings[i].code != 199) {
                warningMessage += '<p>Issue with ' + warnings[i].agent + ': ' + warnings[i].text + '</p>';
            }
        }

        if (noData()) {
            PORTAL.downloadProgressDialog.updateProgress({
                message : 'Your query returned no data to download.<br />' + warningMessage
            });
        }
        else {
            var downloadCount;
            if (resultsReturned) {
                downloadCount = count.total.results;
            }
            else {
                downloadCount = count.total.sites;
            }
            PORTAL.downloadProgressDialog.updateProgress({
                totalCounts : downloadCount,
                message : warningMessage + getCountMessage(),
                fileFormat : fileFormat
            });
        }
    }
};

// =======================
// USGS-EPA Business Rules
// =======================
APP.RULES = {
    isBBoxValid: function(myForm /* DOM element */){
        // Determine if the contents of the bounding box fields are valid . If bBox not valid,
        // update the download dialog and return false.
        // Otherwise return true.

        var north = $(myForm).find('input[name=north]').val();
        var south = $(myForm).find('input[name=south]').val();
        var west = $(myForm).find('input[name=west]').val();
        var east = $(myForm).find('input[name=east]').val();

        if ((north.length == 0) && (south.length == 0) && (west.length == 0) && (east.length == 0)) {
            return true;
        }
        else if ((north.length > 0) && (south.length > 0) && (east.length > 0) && (west.length > 0)){
            var message = '';
            if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
                message += 'Floating point numbers are required for bounding box fields. <br />';
            }
            else {
                if (parseFloat(south) >= parseFloat(north)) {
                    message += 'The value of south ' + south + ' must be less than the value of north ' + north + '. <br />';
                }

                if (parseFloat(west) >= parseFloat(east)) {
                    message += 'The value of west ' + west + ' must be less than the value of east ' + east + '. <br />';
                }
            }
            if (message) {
                PORTAL.downloadProgressDialog.updateProgress({
                    message : message
                });
                return false;
            }
            else {
                return true;
            }
        }
        else {
            PORTAL.downloadProgressDialog.updateProgress({
                message : 'Bounding box values must be all empty or all filled in.'
            });
        }
    },
    isResultsRequestValid: function(myForm /* form */) {
        // Return true if the bbox is valid and if the mimetype is not kml. If false, show
        // an approriate message in the progress dialog and return false.
        if (APP.RULES.isBBoxValid(myForm)) {
            if ($(myForm).find('input[name=mimeType][value=kml]').is(':checked')) {
                PORTAL.downloadProgressDialog.updateProgress({
                    message : 'Results cannot be downloaded in kml'
                });
                return false;
            }
            return true;
        }
    }
};

// ================
// URL Construction
// ================
APP.URLS = {};

APP.URLS = {
    
    getQueryParams : function(forGoogle /* Boolean */) {
        var IGNORE_PARAM_LIST = ["north","south","east","west","resultType","source"];

        var ignoreList = (forGoogle)? IGNORE_PARAM_LIST.concat(["mimeType","zip"]): IGNORE_PARAM_LIST;
        var result = getFormQuery($(APP.DOM.form), ignoreList);

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

/* DOM elements and functions to retrieve info from the DOM. Elements will be assigned
/* after the document has loaded.
*/
APP.DOM = {
    getBBox: function(){
        var myForm = APP.DOM.form;
        return (myForm.north.value && myForm.west.value && myForm.south.value && myForm.east.value)?
                myForm.west.value + "," + myForm.south.value + "," + myForm.east.value + "," + myForm.north.value: "";
    },
    getResultType: function(){
        return $(APP.DOM.form).find('input[name="resultType"]').val();
    }
};


