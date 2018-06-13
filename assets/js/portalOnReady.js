import log from 'loglevel';

import ArcGisOnlineHelpView from './views/arcGisOnlineHelpView';
import DownloadFormView from './views/downloadFormView';
import ShowAPIView from './views/showAPIView';
import SiteMapView from './views/siteMapView';
import DownloadProgressDialog from './downloadProgressDialog';

$(document).ready(function () {
    // Set the loglevel
    if (Config.DEBUG) {
        log.setLevel('debug', false);
    } else {
        log.setLevel('warn', false);
    }

    var $form = $('#params');

    // Create sub views
    var downloadProgressDialog = new DownloadProgressDialog($('#download-status-dialog'));
    var downloadFormView = new DownloadFormView({
        $form : $form,
        downloadProgressDialog : downloadProgressDialog
    });
    var siteMapView = new SiteMapView({
        $container : $('#mapping-div'),
        downloadProgressDialog : downloadProgressDialog,
        downloadFormView : downloadFormView
    });
    var showAPIView = new ShowAPIView({
        $container : $('#show-queries-div'),
        getQueryParamArray : $.proxy(downloadFormView.getQueryParamArray, downloadFormView),
        getResultType: $.proxy(downloadFormView.getResultType, downloadFormView)
    });

    var arcGisOnlineHelpView = new ArcGisOnlineHelpView({
        $button : $('#show-arcgis-online-help'),
        $dialog : $('#arcgis-online-dialog'),
        $siteMapViewContainer : $('#mapping-div'),
        getQueryParamArray : $.proxy(downloadFormView.getQueryParamArray, downloadFormView)
    });

    //Initialize subviews
// original line    var initDownloadForm = downloadFormView.initialize();
    var initDownloadForm = downloadFormView.initialize($.proxy(showAPIView.updateWebCallDisplay, showAPIView), $.proxy(showAPIView.hideDivOnChange, showAPIView)); // new line for WQP-1195
    siteMapView.initialize();
    showAPIView.initialize();
    arcGisOnlineHelpView.initialize();

    initDownloadForm.fail(function() {
        $('#service-error-dialog').modal('show');
    });
});
