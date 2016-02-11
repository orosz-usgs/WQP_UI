/*jslint browser: true*/
/* global $*/
/* global alert */
/* global _gaq */
/* global Config */
/* global IdentifyDialog */
/* global PortalDataMap */
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

	//Initialize subviews
	var initDownloadForm = downloadFormView.initialize();
	siteMapView.initialize();

	// Add click handler for the Show queries button
	$('#show-queries-button').click(function () {
		// Generate the request from the form
		var queryString = PORTAL.UTILS.getQueryString(downloadFormView.getQueryParamArray());
		var stationSection = "<div class=\"show-query-text\"><b>Sites</b><br><textarea readonly=\"readonly\" rows='6'>" + PORTAL.queryServices.getFormUrl('Station', queryString) + "</textarea></div>";
		var resultSection = "<div class=\"show-query-text\"><b>Results</b><br><textarea readonly=\"readonly\" rows='6'>" + PORTAL.queryServices.getFormUrl('Result', queryString) + "</textarea></div>";

		$('#WSFeedback').html(stationSection + resultSection);
	});

	initDownloadForm.fail(function() {
		$('#service-error-dialog').modal('show');
	});

});

