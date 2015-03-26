var PORTAL = PORTAL || {};
PORTAL.MODELS = PORTAL.MODELS || {};

PORTAL.MODELS.providers = function(){
    var ids = [];

    return {
        initialize : function(successFnc /* first argument is array of provider names */,
                              failureFnc /* function with argument String status */) {
            $.ajax({
                url : 'codes/providers',
                data : {mimetype : 'xml'},
                type : 'GET',
                success: function(data, textStatus, jqXHR) {
                    ids = [];
                    $(data).find('provider').each(function() {
                        ids.push($(this).text());
                    });
                    successFnc(ids);
                },
                error : function(jqXHR, textStatus, error) {
                    ids = [];
                    failureFnc(error);
                }
            });
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


