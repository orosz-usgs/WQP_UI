var PORTAL = PORTAL || {};

PORTAL.onReady = function() {
    var initProviderSelect = function(ids) {
        PORTAL.VIEWS.createStaticSelect2($('#providers-select'), ids);
    };
    var failedProviders = function(error) {
        alert('Unable to retrieve provider list with error: ' + error);
    };
    var placeSelects;
    var select2Options = {
    };

    PORTAL.portalDataMap; // Don't initialize portalDataMap until it has been shown.


    APP.DOM.form = document.getElementById("params");

    PORTAL.downloadProgressDialog = PORTAL.VIEWS.downloadProgressDialog($('#download-status-dialog'));

    PORTAL.MODELS.providers.initialize(initProviderSelect, failedProviders);

    placeSelects = PORTAL.VIEWS.placeSelects($('#countrycode'), $('#statecode'), $('#countycode'));

    // Initialize the rest of the selects
    PORTAL.VIEWS.createCodeSelect($('#siteType'), {model : PORTAL.MODELS.siteType}, select2Options);
    PORTAL.VIEWS.createCodeSelect(
            $('#organization'),
            {
                model : PORTAL.MODELS.organization,
                formatData : function(data) {
                    return {
                        id : data.id,
                        text : data.id + ' - ' + data.desc
                    };
                },
                isMatch : function(data, searchTerm) {
                    if (searchTerm) {
                        var searchTermUpper = searchTerm.toUpperCase();
                        return ((data.id.toUpperCase().indexOf(searchTermUpper) > - 1) ||
                                (data.desc.toUpperCase().indexOf(searchTermUpper) > -1));
                    }
                    else {
                        return true;
                    }
                }
            },
            $.extend({}, select2Options, {
                closeOnSelect : false,
                minimumInputLength : 2
            })
    );
    PORTAL.VIEWS.createCodeSelect($('#sampleMedia'), {model : PORTAL.MODELS.sampleMedia}, select2Options);
    PORTAL.VIEWS.createCodeSelect($('#characteristicType'), {model : PORTAL.MODELS.characteristicType}, select2Options);
    PORTAL.VIEWS.createCodeSelect(
            $('#characteristicName'),
            {model : PORTAL.MODELS.characteristicName},
            $.extend({}, select2Options, {
                closeOnSelect : false,
                minimumInputLength :  2,
                // We want the characterstics sorted by result length.
                sortResults : function(results, container, query) {
                    if (query.term) {
                        results.sort(function(a, b) {
                            if (a.text.length > b.text.length) {
                                return 1;
                            }
                            else if (a.text.length < b.text.length) {
                                return -1;
                            }
                            else {
                                return 0;
                            }
                        });
                    }
                    return results;
                }
            })
    );

    // Add input validations and reformatting handlers
    PORTAL.VIEWS.inputValidation({
        inputEl : $('#siteid'),
        validationFnc : PORTAL.validators.siteIdValidator
    });
    PORTAL.VIEWS.inputValidation({
        inputEl : $('#startDateLo'),
        validationFnc : PORTAL.dateValidator.validate,
        updateFnc : function(value) {
            return PORTAL.dateValidator.format(value, true);
        }
    });
    PORTAL.VIEWS.inputValidation({
        inputEl : $('#startDateHi'),
        validationFnc : PORTAL.dateValidator.validate,
        updateFnc : function(value) {
            return PORTAL.dateValidator.format(value, false);
        }
    });
    PORTAL.VIEWS.inputValidation({
        inputEl : $('#bounding-box input[type="text"]'),
        validationFnc : PORTAL.validators.realNumberValidator
    });
    PORTAL.VIEWS.inputValidation({
        inputEl : $('#point-location input[type="text"]'),
        validationFnc : PORTAL.validators.realNumberValidator
    });
    PORTAL.VIEWS.inputValidation({
        inputEl : $('#huc'),
        validationFnc : PORTAL.hucValidator.validate,
        updateFnc : PORTAL.hucValidator.format
    });

    // Create help popovers which close when you click anywhere else other than another popover trigger.
    $('html').click(function(e) {
        $('.popover-help').popover('hide');
    });
    $('.popover-help').each(function() {
        var options = $.extend({}, PORTAL.MODELS.help[($(this).data('help'))], {
            html : true,
            trigger : 'manual'
        });
        $(this).popover(options).click(function(e) {
            $(this).popover('toggle');
            e.stopPropagation();
        });
    });

    // Add Click handler for form show/hide/button
    $('.panel-heading .show-hide-toggle').click(function() {
        toggleShowHideSections($(this), $(this).parents('.panel').find('.panel-body'));
    });

    $('.subpanel-heading .show-hide-toggle').click(function() {
        toggleShowHideSections($(this), $(this).parents('.subpanel').find('.subpanel-body'));
    });

    // Set the height of the map div to match the mapBox. Add a resize
    // handler so that the height stays in sync. OpenLayers does not want to draw
    // the layer if the height is not set explictly.
    var mapBox = $('#query-map-box');
    var mapDiv = $('#query-results-map');
    mapDiv.height(mapBox.height());
    $(window).resize(function() {
        if (mapBox.height() !== mapDiv.height()) {
            mapDiv.height(mapBox.height());
        }
    });

    // Set up Show Sites button
    $('#show-on-map-button').click(function() {
        if (!PORTAL.CONTROLLERS.validateDownloadForm()) { return; }
        _gaq.push(['_trackEvent', 'Portal Map', 'MapCount', decodeURIComponent(APP.URLS.getQueryParams())]);
        PORTAL.downloadProgressDialog.show('map', function(count) {
            // Show the map if it is currently hidden
            if ($('#query-map-box').is(':hidden')) {
                $('#mapping-div .show-hide-toggle').click();
            }

            _gaq.push(['_trackEvent', 'Portal Map', 'MapCreate',  decodeURIComponent(APP.URLS.getQueryParams()), parseInt(count)]);

            // Start mapping process by disabling the show site button and then requesting the layer
            $('#show-on-map-button').attr('disabled', 'disabled').removeClass('query-button').addClass('disable-query-button');
            PORTAL.portalDataMap.fetchDataLayer(getFormValues($('#params'),
                ['north', 'south', 'east', 'west', 'resultType', 'source', 'mimeType', 'zip','__ncforminfo' /*input is injected by barracuda firewall*/]),
                function() {
                    $('#show-on-map-button').removeAttr('disabled').removeClass('disable-query-button').addClass('query-button');
                }
            );
        });

        //Get the head request. We are doing this synchronously which is why the timeout is needed
        // so that we don't get stuck in the click callback. Should look at making this asynchronous.
        setTimeout(function() {
            APP.DOWNLOAD.beforeSubmit(APP.DOM.form, 'Station');
        }, 500);
    });

    // Set up the Download button
    $('#main-button').click(function(event){
        if (!PORTAL.CONTROLLERS.validateDownloadForm()) { return; }
        event.preventDefault();
        _gaq.push(['_trackEvent', 'Portal Page', APP.DOM.getResultType() + 'Count', decodeURIComponent(APP.URLS.getQueryParams())]);

        PORTAL.downloadProgressDialog.show('download', function(count) {
             _gaq.push(['_trackEvent', 'Portal Page', APP.DOM.getResultType() + 'Download', decodeURIComponent(APP.URLS.getQueryParams()), parseInt(count)]);
             $('#params').submit();
        });

        //Get the head request. We are doing this synchronously which is why the timeout is needed
        // so that we don't get stuck in the click callback. Should look at making this asynchronous.
        setTimeout(function() {
            APP.DOWNLOAD.beforeSubmit(APP.DOM.form,  $(APP.DOM.form).find('input[name=resultType]').val());
        }, 500);
    });

    // GeoLocation easter egg. Most of code copied from Head First HTML5

    function updateMyLocation(){
            if (navigator.geolocation && navigator.geolocation.getCurrentPosition){
                    navigator.geolocation.getCurrentPosition(updateFormLocation, displayError,{timeout: 8000, maximumAge: 60000});
            } else {
                    alert("Sorry! your browser does not support geolocation.");
            }
            return false;
    }

    function updateFormLocation(position){
        $('#lat').val(position.coords.latitude);
        $('#long').val(position.coords.longitude);
    }

    function displayError(error) {
            var errorTypes = {
                    0: "Unknown error",
                    1: "Permission denied by user",
                    2: "Position is not available",
                    3: "Request timed out"
            };
            var errorMessage = errorTypes[error.code];
            if (error.code == 0 || error.code == 2) {
                    errorMessage = errorMessage + " " + error.message;
            }
            alert(errorMessage);
    }

    // only give user the option if their browser supports geolocation
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition){
        $('#useMyLocation').html('<button class="btn btn-info" type="button">Use my location</button>');
        $('#useMyLocation button').click(function() {
            updateMyLocation();
        });
    }
};
