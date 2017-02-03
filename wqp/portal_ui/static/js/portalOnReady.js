/*jslint browser: true*/
/* global $*/
/* global Config */
/* global log */

var PORTAL = PORTAL || {};

$(document).ready(function () {
	"use strict";

	// Set the loglevel
	if (Config.DEBUG) {
		log.setLevel('debug', false);
	}
	else {
		log.setLevel('warn', false);
	}

	var $form = $('#params');

	// Create sub views
	var downloadProgressDialog = PORTAL.VIEWS.downloadProgressDialog($('#download-status-dialog'));
	var downloadFormView = PORTAL.VIEWS.downloadFormView({
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
	var arcGisOnlineDialog = PORTAL.VIEWS.arcGisOnlineDialog($('#arcgis-online-dialog'));

	var arcGisOnlineHelpView = PORTAL.VIEWS.arcGisOnlineHelpView({
		$container : $('#show-queries-div'),
		arcGisOnlineDialog : arcGisOnlineDialog
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

