import log from 'loglevel';

import ArcGisOnlineHelpView from './views/arcGisOnlineHelpView';
import DownloadFormView from './views/downloadFormView';


var PORTAL = window.PORTAL = window.PORTAL || {};

$(document).ready(function () {
    // Set the loglevel
    if (Config.DEBUG) {
        log.setLevel('debug', false);
    } else {
        log.setLevel('warn', false);
    }

    var $form = $('#params');

    // Create sub views
    var downloadProgressDialog = PORTAL.VIEWS.downloadProgressDialog($('#download-status-dialog'));
    var downloadFormView = new DownloadFormView({
        $form : $form,
        downloadProgressDialog : downloadProgressDialog
    });
    var siteMapView = PORTAL.VIEWS.siteMapView({
        $container : $('#mapping-div'),
        downloadProgressDialog : downloadProgressDialog,
        downloadFormView : downloadFormView
    });
    var showAPIView = PORTAL.VIEWS.showAPIView({
        $container : $('#show-queries-div'),
        getQueryParamArray : downloadFormView.getQueryParamArray
    });

    var arcGisOnlineHelpView = new ArcGisOnlineHelpView({
        $button : $('#show-arcgis-online-help'),
        $dialog : $('#arcgis-online-dialog'),
        $siteMapViewContainer : $('#mapping-div'),
        getQueryParamArray : downloadFormView.getQueryParamArray
    });

    //Initialize subviews
    var initDownloadForm = downloadFormView.initialize();
    siteMapView.initialize();
    showAPIView.initialize();
    arcGisOnlineHelpView.initialize();

    initDownloadForm.fail(function() {
        $('#service-error-dialog').modal('show');
    });

});
