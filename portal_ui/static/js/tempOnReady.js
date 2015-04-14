var PORTAL = PORTAL || {};

PORTAL.tempOnReady = function() {
    // Toggle the sensitivity of the Samples buttons if KML check button is clicked and update the hidden form input
    $('#download-box input[name="mimeType"]:radio').click(function(){
        var sensitive = !($('#download-box #kml').prop('checked'));

        setEnabled($('#download-box #samples'), sensitive);
        setEnabled($('#download-box #biosamples'), sensitive);
        $('#params input[name="mimeType"]:hidden').val($(this).val());
    });

    // Toggle the sensitivity of the KML button if Samples buttons clicked.
    // Update the form's action url.
    // Toggle the sensitivity of the Show Sites on map button

    $('#download-box input[name=resultType]').click(function(){
        var sensitive = !($('#download-box #samples').prop('checked')) && !($('#download-box #biosamples').prop('checked'));
        setEnabled($('#download-box #kml'), sensitive);

        $('#params').attr('action', APP.URLS[$(this).val()]);
        $('#params input[name="resultType"]:hidden').val($(this).val());
    });

    //Update bBox hidden input if any of the bounding box text fields are updated
    $('#bounding-box input').change(function() {
        $(APP.DOM.form).find('input[name=bBox]').val(APP.DOM.getBBox());
    });

    // Add click handler for the Show queries button
    $('#show-queries-button').click(function() {
        // Generate the request from the form
        // REST Request (there used to be SOAP request please see svn for previous revisions)
        var stationSection = "<div class=\"show-query-text\"><b>Sites</b><br><textarea readonly=\"readonly\" rows='6'>" + APP.URLS.getFormUrl('Station') + "</textarea></div>";
        var resultSection = "<div class=\"show-query-text\"><b>Physical/Chemical results</b><br><textarea readonly=\"readonly\" rows='6'>" + APP.URLS.getFormUrl('Result') + "</textarea></div>";
        var biologicalResultSection = "<div class=\"show-query-text\"><b>Biological results</b><br><textarea readonly=\"readonly\" rows='6'>" + APP.URLS.getFormUrl('biologicalresult') + "</textarea></div>";

        $('#WSFeedback').html(stationSection + resultSection); // temporarily reoving + biologicalResultSection);
    });
    // Initialize portal data map and identify dialog
    var identifyDialog = new IdentifyDialog('map-info-dialog', function(resultType) { return APP.URLS[resultType];});

    // Add click handler for map show/hide button
    $('#mapping-div .show-hide-toggle').click(function() {
        var isVisible = toggleShowHideSections($(this), $('#query-map-box'));
        var boxIdToggleEl = $('#map-identify-tool');

        if (isVisible) {
            setEnabled(boxIdToggleEl, true);
            if (!PORTAL.portalDataMap) {
                PORTAL.portalDataMap = new PortalDataMap('query-results-map', 'map-loading-div', identifyDialog);
                $('#cancel-map-button').click(function() {
                    PORTAL.portalDataMap.cancelMapping();
                });
            }

        }
        else {
            setEnabled(boxIdToggleEl, false);
        }
    });

    // Add click handler for identify tool
    $('#map-identify-tool').click(function() {
        PORTAL.portalDataMap.toggleBoxId();
    });
};
