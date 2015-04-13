var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};
/* Initializes the place select2's. Returns an object with property functions,
 * getCountries, getStates, and getCounties which return the current selections.
 *
 * @param {jquery element for hidden input} countryEl
 * @param {jquery element for hidden input} stateEl
 * @param {jquery element for hidden input} countyEl
 * @returns {PORTAL.VIEWS.placeSelects.that}
 */
PORTAL.VIEWS.placeSelects = function(countryEl, stateEl, countyEl) {

    var that = {};

    /*
     * @ returns an array of currently selected contries
     */
    that.getCountries = function() {
        var results = countryEl.select2('val');
        if (results.length === 0) {
            return ['US'];
        }
        else {
            return results;
        }
    };

    /*
     * @returns an array of currently selected states
     */
    that.getStates = function() {
        return stateEl.select2('val');
    };

    /*
     * @returns an array of currently selected counties
     */
    that.getCounties = function() {
        return countyEl.select2('val');
    };

    /* Putting the isMatch functions in the returned object for ease of testing
     * @param {Object with id, desc, and providers properties} data
     * @param {String} searchTerm
     * @returns boolean
     */
    that.isCountryMatch = function (data, searchTerm) {
        if (searchTerm) {
            var search = searchTerm.toUpperCase();

            return((data.id.toUpperCase().indexOf(search) > -1) ||
                    (data.desc.toUpperCase().indexOf(search) > -1));
        }
        else {
            return true;
        }
    };

    /*
     * @param {Object with id, desc, and providers properties} data
     * @param {String} searchTerm
     * @returns boolean
     */
    that.isStateMatch = function(data, searchTerm) {
        if (searchTerm) {
            var search = searchTerm.toUpperCase();
            var codes = data.id.split(':');
            var stateDesc = data.desc.split(',');
            var stateName = stateDesc[stateDesc.length - 1].toUpperCase();

            return ((codes[0] === 'US') && (stateFIPS.getPostalCode(codes[1]).indexOf(search) > - 1) ||
                    (stateName.indexOf(search) > -1));
        }
        else {
            return true;
        }
    };

    /*
     * @param {Object with id, desc, and providers properties} data
     * @param {String} searchTerm
     * @returns boolean
     */
    that.isCountyMatch = function(data, searchTerm) {
        if (searchTerm) {
            var codes = data.desc.split(',');
            return (codes[codes.length - 1].toUpperCase().indexOf(searchTerm.toUpperCase()) > -1);
        }
        else {
            return true;
        }
    };

    /*
     * Initialize country select2
     */
    var countrySpec = {
        model : PORTAL.MODELS.countryCodes,
        isMatch : that.isCountryMatch
    };

    PORTAL.VIEWS.createCodeSelect(countryEl, countrySpec, {
    });

    countryEl.on('change', function(e) {
        /* update states */
        var states = stateEl.select2('data');

        var newStates = [];

        for (var i = 0; i < states.length; i++) {
            var keep = false;
            for (var j = 0; j < e.val.length; j++) {
                if (states[i].id.split(':')[0] === e.val[j]) {
                    keep = true;
                    break;
                }
            }
            if (keep) {
                newStates.push(states[i]);
            }
        }

        stateEl.select2('data', newStates, true);
    });

    /*
     * Initialize state select2
     */

    var stateSpec = {
        model : PORTAL.MODELS.stateCodes,
        isMatch : that.isStateMatch,
        getKeys : that.getCountries
    };

    PORTAL.VIEWS.createCodeSelect(stateEl, stateSpec, {
        formatSelection: function(object, container) {
            var codes = object.id.split(':');
            if (codes[0] === 'US') {
                return codes[0] + ':' + stateFIPS.getPostalCode(codes[1]);
            }
            else {
                return object.id;
            }
        }
    });

   stateEl.on('change', function(e) {
        var counties = countyEl.select2('data');

        var newCounties = [];

        for (var i = 0; i < counties.length; i++) {
            var codes = counties[i].id.split(':');
            var stateCode = codes[0] + ':' + codes[1];

            var keep = false;
            for (var j = 0; j < e.val.length; j++) {
                if (stateCode === e.val[j]) {
                    keep = true;
                    break;
                }
            }
            if (keep) {
                newCounties.push(counties[i]);
            }
        }

        countyEl.select2('data', newCounties, true);
    });

    /*
     * Initialize count select2
     */
    var countySpec = {
        model : PORTAL.MODELS.countyCodes,
        isMatch : that.isCountyMatch,
        getKeys : that.getStates
    };

    PORTAL.VIEWS.createCodeSelect(countyEl, countySpec, {
        formatSelection : function(object, container) {
            var codes = object.id.split(':');
            if (codes[0] === 'US') {
                return codes[0] + ':' + stateFIPS.getPostalCode(codes[1]) + ':' + codes[2];
            }
            else {
                return object.id;
            }
        }
    });

    countyEl.on('select2-opening', function(e) {
        if (that.getStates().length === 0) {
           alert('Please select at least one state');

           e.preventDefault();
        }
    });

    return that;
};


