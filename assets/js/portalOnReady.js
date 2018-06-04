/*jslint browser: true*/
/* global $*/
/* global Config */
/* global log */

const PORTAL = window.PORTAL = window.PORTAL || {};

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

	var arcGisOnlineHelpView = PORTAL.VIEWS.arcGisOnlineHelpView({
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

