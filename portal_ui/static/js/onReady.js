/*jslint browser: true*/
/* global $*/
/* global alert */
/* global _gaq */
/* global Config */
/* global IdentifyDialog */
/* global PortalDataMap */

var PORTAL = PORTAL || {};

$(document).ready(function () {
	"use strict";
	//TODO: Remove this globals
	PORTAL.portalDataMap = undefined;  // Don't initialize portalDataMap until it has been shown.

	var $form = $('#params');

	var downloadProgressDialog = PORTAL.VIEWS.downloadProgressDialog($('#download-status-dialog'));
	var downloadFormView = PORTAL.VIEWS.downloadFormView({
		$form : $form,
		downloadProgressDialog : downloadProgressDialog
	});

	downloadFormView.initialize();

	// Set the height of the map div to match the mapBox. Add a resize
	// handler so that the height stays in sync. OpenLayers does not want to draw
	// the layer if the height is not set explictly.
	var mapBox = $('#query-map-box');
	var mapDiv = $('#query-results-map');
	mapDiv.height(mapBox.height());
	$(window).resize(function () {
		if (mapBox.height() !== mapDiv.height()) {
			mapDiv.height(mapBox.height());
		}
	});

	// Set up Show Sites button
	$('#show-on-map-button').click(function () {
		var showMap = function (totalCount) {
			// Show the map if it is currently hidden
			if ($('#query-map-box').is(':hidden')) {
				$('#mapping-div .show-hide-toggle').click();
			}

			_gaq.push([
				'_trackEvent',
				'Portal Map',
				'MapCreate',
				decodeURIComponent(downloadFormView.getQueryParams()),
				parseInt(totalCount)
			]);
			// Start mapping process by disabling the show site button and then requesting the layer
			$('#show-on-map-button').attr('disabled', 'disabled').removeClass('query-button').addClass('disable-query-button');
			var formParams = PORTAL.UTILS.getFormValues(
				$form,
				['mimeType', 'zip', '__ncforminfo' /*input is injected by barracuda firewall*/],
				true
			);
			PORTAL.portalDataMap.showDataLayer(formParams, function () {
				$('#show-on-map-button').removeAttr('disabled').removeClass('disable-query-button').addClass('query-button');
			});
		};

		if (!PORTAL.CONTROLLERS.validateDownloadForm($form)) {
			return;
		}

		_gaq.push([
			'_trackEvent',
			'Portal Map',
			'MapCount',
			decodeURIComponent(downloadFormView.getQueryParams())
		]);

		downloadProgressDialog.show('map');
		PORTAL.queryServices.fetchHeadRequest('Station', downloadFormView.getQueryParams()).done(function (response) {
			var fileFormat = 'xml';
			var counts = PORTAL.DataSourceUtils.getCountsFromHeader(response, PORTAL.MODELS.providers.getIds());

			downloadProgressDialog.updateProgress(counts, 'Station', fileFormat, showMap);

		}).fail(function (message) {
			downloadProgressDialog.cancelProgress(message);
		});
	});

	// Add click handler for the Show queries button
	$('#show-queries-button').click(function () {
		// Generate the request from the form
		// REST Request (there used to be SOAP request please see svn for previous revisions)
		var stationSection = "<div class=\"show-query-text\"><b>Sites</b><br><textarea readonly=\"readonly\" rows='6'>" + PORTAL.queryServices.getFormUrl('Station') + "</textarea></div>";
		var resultSection = "<div class=\"show-query-text\"><b>Results</b><br><textarea readonly=\"readonly\" rows='6'>" + PORTAL.queryServices.getFormUrl('Result') + "</textarea></div>";

		$('#WSFeedback').html(stationSection + resultSection); // temporarily reoving + biologicalResultSection);
	});
	// Initialize portal data map and identify dialog
	var identifyDialog = new IdentifyDialog('map-info-dialog', PORTAL.queryServices.getFormUrl);

	// Add click handler for map show/hide button
	$('#mapping-div .show-hide-toggle').click(function () {
		var isVisible = PORTAL.UTILS.toggleShowHideSections($(this), $('#query-map-box'));
		var boxIdToggleEl = $('#map-identify-tool');

		if (isVisible) {
			PORTAL.UTILS.setEnabled(boxIdToggleEl, true);
			if (!PORTAL.portalDataMap) {
				PORTAL.portalDataMap = new PortalDataMap('query-results-map', 'map-loading-div', identifyDialog);
				$('#cancel-map-button').click(function () {
					PORTAL.portalDataMap.cancelMapping();
				});
			}

		}
		else {
			PORTAL.UTILS.setEnabled(boxIdToggleEl, false);
		}
	});

	// Add click handler for identify tool
	$('#map-identify-tool').click(function () {
		PORTAL.portalDataMap.toggleBoxId();
	});
});

