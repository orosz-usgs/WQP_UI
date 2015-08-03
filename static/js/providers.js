var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

PORTAL.MODELS.providers = function(){
    var ids = [];

    return {
    	/*
    	 * @return {$.Deferred.promise} which is resolved if the fetch of providers is a success and rejected with the erro
    	 * message if the request fails. 
    	 */
        initialize : function() {
        	var deferred = $.Deferred();
            $.ajax({
                url : Config.CODES_ENDPOINT + '/providers',
                data : {mimeType : 'json'},
                type : 'GET',
                success: function(data, textStatus, jqXHR) {
                    ids = [];
                    $.each(data.codes, function(index, code) {
                    	ids.push(code.value);
                    });
                    deferred.resolve();
                },
                error : function(jqXHR, textStatus, error) {
                    ids = [];
                    deferred.reject(error);
                }
            });
            return deferred.promise();
        },
        
        getIds : function() {
            return ids;
        },
        
        formatAvailableProviders : function(availableProviders /* String containing space separated list of providers */) {
            /*
             * Returns a formatted string describing the availableProviders. The function will remove ids that are not
             * in the ids attribute. If all providers are in availableProviders than the word 'all' will be returned.
             */

            var availableList = availableProviders.split(' ');
            var resultList = [];
            var i;

            for (i = 0; i < ids.length; i++) {
                if ($.inArray(ids[i], availableList) !== -1) {
                    resultList.push(ids[i]);
                }
            }

            if (resultList.length === 0) {
                return null;
            }
            else if (resultList.length === ids.length) {
                return 'all';
            }
            else {
                return resultList.join(', ');
            }
        }
    };
}();


