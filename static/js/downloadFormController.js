var PORTAL = PORTAL || {};

PORTAL.CONTROLLERS = PORTAL.CONTROLLERS || {};

PORTAL.CONTROLLERS.validatePointLocation = function(spec) {
    // spec has the following properties
    //      withinEl, latEl, lonEl : input jquery elements
    // Returns object. The object has a required property isValid. If isValid is false, the
    // object will also contain errorMessage property.
    // Assumes that individual input validation has already been done
    var within = spec.withinEl.val();
    var lat = spec.latEl.val();
    var lon = spec.lonEl.val();

    if ((within) && (lat) && (lon)) {
        return { isValid : true };
    }
    else if ((within) || (lat) || (lon)) {
        return {
            isValid : false,
            errorMessage : 'In Point Location all parameters must be blank or all parameters must have a non-blank value'
        };
    }
    else {
        return { isValid : true };
    }
};

PORTAL.CONTROLLERS.validateBoundingBox = function(spec) {
    // spec has the following properites
    //      northEl, southEl, eastEl, westEl : input jquery elements
    // Returns object. The object has a required property isValid. If isValid is false, the
    // object will also contain errorMessage property.
    // Assumes that individual input validation has already been done

    var north = spec.northEl.val();
    var south = spec.southEl.val();
    var east = spec.eastEl.val();
    var west = spec.westEl.val();

    if ((north) && (south) && (east) && (west)) {
        if (parseFloat(south) >= parseFloat(north)) {
            return {
                isValid : false,
                errorMessage : 'In Bounding Box, north must be greater than south'
            };
        }
        else if (parseFloat(west) >= parseFloat(east)) {
            return {
                isValid : false,
                errorMessage : 'In Bounding Box, east must be greater than west'
            };
        }
        else {
            return { isValid : true };
        }
    }
    else if ((north) || (south) || (east) || (west)) {
        return {
            isValid : false,
            errorMessage : 'In Bounding Box, all parameters must be blank or all must have a non-blank value.'
        };
    }
    else {
        return { isValid : true };
    }
};

PORTAL.CONTROLLERS.validateDateRange = function(spec) {
    // spec has the following properties:
    //      fromDateEl, toDateEl - Input jquery elements
    // Returns object. The object has a required property isValid. If isValid is false, the
    // object will also contain errorMessage property.
    // Assumes that individual input validation has already been done.

    var getDate = function(value) {
        dateArray = value.split('-');
        return new Date(dateArray[2], dateArray[0] - 1, dateArray[1], 0, 0, 0, 0);
    };

    var fromDateStr = spec.fromDateEl.val();
    var toDateStr = spec.toDateEl.val();

    if ((fromDateStr) && (toDateStr)) {
        if (getDate(fromDateStr) < getDate(toDateStr)) {
            return { isValid : true };
        }
        else {
            return {
                isValid : false,
                errorMessage : 'From date must be before to date'
            };
        }
    }
    else {
        return { isValid : true };
    }
};

PORTAL.CONTROLLERS.validateDownloadForm = function() {
    // Validate download form. If invalid show validate dialog with error message and return false.
    // Otherwise return true

    var validateModalEl = $('#validate-download-dialog');
    var showModal = function(message) {
        validateModalEl.find('.modal-body').html(message);
        validateModalEl.modal('show');
    };

    // Check to see if any input validation error messages exist
    if ($('#params .error-message').length > 0) {
       showModal('Need to correct input validation errors on form');
       return false;
    }

    var result;
    result = PORTAL.CONTROLLERS.validatePointLocation({
        withinEl : $('#within'),
        latEl : $('#lat'),
        lonEl : $('#long')
    });
    if (!result.isValid) {
        showModal(result.errorMessage);
        return false;
    }

    result = PORTAL.CONTROLLERS.validateBoundingBox({
        northEl : $('#north'),
        southEl : $('#south'),
        eastEl : $('#east'),
        westEl : $('#west')
    });
    if (!result.isValid) {
        showModal(result.errorMessage);
        return false;
    }

    result = PORTAL.CONTROLLERS.validateDateRange({
        fromDateEl : $('#startDateLo'),
        toDateEl : $('#startDateHi')
    });
    if (!result.isValid) {
        showModal(result.errorMessage);
        return false;
    }

    return true;
};


