var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * @param {jquery element selecting a hidden input} el
 * @param {Array of Strings to be used for selection options} ids
 * @param {Object} select2Options
 * @returns {undefined}
 */
PORTAL.VIEWS.createStaticSelect2 = function(el /* jquery select element */, ids /* Array of ids */, select2Options /* Object with additional select2 properties */) {
    var defaultOptions = {
        placeholder: 'All',
        allowClear : true
    };
    var selectHtml = '';
    var i;

    for (i = 0; i <  ids.length; i++) {
        selectHtml += '<option value="' + ids[i] + '">' + ids[i] + '</option>';
    }
    el.append(selectHtml);
    el.select2($.extend({}, defaultOptions, select2Options));
};

/*
 *
 * @param {jquery element selecting a hidden input} el
 * @param {Object} spec
 *  spec has the following properties
     @prop {Object} model : object which inherits from PORTAL.MODELS.cachedCodes or PORTAL.MODELS.codesWithKeys
     @prop {Function} isMatch : function with two parameters - data (object with id, desc and providers) and searchTerm - String.
     *     isMatch is optional. By default it will try to match only the descr property
     @prop {Function} formatData : function takes data (object with id, desc, and providers) and produces a select2 result object
     *     with id and text properties. This is optional
     @prop {Function} getKeys : function which when called returns an array of keys used in model.processData.
 * @param {Object} select2Options
 * @returns {undefined}
 */
PORTAL.VIEWS.createCodeSelect = function(el /* jquery hidden input elements */, spec /* Object */, select2Options /* select2 options which will be merged with defaults */) {
    /*
     * spec has the following properties
     * model : object which inherits from PORTAL.MODELS.codes or PORTAL.MODELS.codesWithKeys
     * isMatch : function with two parameters - data (object with id, desc and providers) and searchTerm - String.
     *     isMatch is optional. By default it will try to match only the descr property
     * formatData : function takes data (object with id, desc, and providers) and produces a select2 result object
     *     with id and text properties. This is optional
     * getKeys : function which when called returns an array of keys used in model.processData.
     *
     */

    // Assign defaults for optional parameters
    if (!('isMatch' in spec)) {
        spec.isMatch = function(data, searchTerm) {
            if (searchTerm) {
                return (data.desc.toUpperCase().indexOf(searchTerm.toUpperCase()) > -1);
            }
            else {
                return true;
            }
        };
    }

    if (!('formatData' in spec)) {
        spec.formatData = function(data) {
            return {
                id : data.id,
                text : data.desc + ' (' + PORTAL.MODELS.providers.formatAvailableProviders(data.providers) + ')'
            };
        };
    }

    if(!('getKeys' in spec)) {
        spec.getKeys = function() {
            return;
        };
    }

    var defaultOptions = {
        placeholder : 'All',
        allowClear : true,
        multiple : true,
        separator: ';',
        formatSelection : function(object, container) {
            return object.id;
        },
        query: function(options) {
        	spec.model.processData(spec.getKeys()).done(function(data) {
                var i, key;
                var results = [];
                var dataArray = [];

                if (length in data && data.length > 0) {
                    dataArray = dataArray.concat(data);
                }
                else {
                    for (key in data) {
                        if ((data[key]) && data[key].length > 0){
                            dataArray = dataArray.concat(data[key]);
                        }
                    }
                }

                for (i = 0; i < dataArray.length; i++) {
                    if (spec.isMatch(dataArray[i], options.term)) {
                        results.push(spec.formatData(dataArray[i]));
                    }
                }
                options.callback({'results' : results});
            });
        }
    };

    el.select2($.extend(defaultOptions, select2Options));
};

