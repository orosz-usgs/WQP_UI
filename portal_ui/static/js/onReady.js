/*jslint browser: true*/
/* global $*/
/* global alert */
/* global _gaq */
/* global Config */
/* global IdentifyDialog */
/* global PortalDataMap */

var PORTAL = PORTAL || {};

PORTAL.onReady = function () {
	"use strict";

	var placeSelects;
	var select2Options = {};


	PORTAL.portalDataMap = undefined;  // Don't initialize portalDataMap until it has been shown.

	PORTAL.downloadProgressDialog = PORTAL.VIEWS.downloadProgressDialog($('#download-status-dialog'));

	PORTAL.MODELS.providers.fetch()
		.done(function () {
			PORTAL.VIEWS.createStaticSelect2($('#providers-select'),
				PORTAL.MODELS.providers.getIds());
		})
		.fail(function (error) {
			alert('Unable to retrieve provider list with error: ' + error);
		});

	placeSelects = PORTAL.VIEWS.placeSelects($('#countrycode'), $('#statecode'), $('#countycode'));

	// Initialize the rest of the selects
	PORTAL.VIEWS.createCodeSelect($('#siteType'), {model: PORTAL.MODELS.siteType}, select2Options);
	PORTAL.VIEWS.createCodeSelect(
		$('#organization'),
		{
			model: PORTAL.MODELS.organization,
			formatData: function (data) {
				return {
					id: data.id,
					text: data.id + ' - ' + data.desc
				};
			},
			isMatch: function (searchTerm, data) {
				var termMatcher;
				if (searchTerm) {
					termMatcher = new RegExp(searchTerm, 'i');
					return (termMatcher.test(data.id) || termMatcher.test(data.desc));
				}
				else {
					return true;
				}
			}
		},
		$.extend({}, select2Options, {
			minimumInputLength: 2,
		})
	);
	PORTAL.VIEWS.createCodeSelect($('#sampleMedia'), {model: PORTAL.MODELS.sampleMedia}, select2Options);
	PORTAL.VIEWS.createCodeSelect($('#characteristicType'), {model: PORTAL.MODELS.characteristicType}, select2Options);
	PORTAL.VIEWS.createPagedCodeSelect($('#characteristicName'), {codes: 'characteristicname'}, select2Options);
	PORTAL.VIEWS.createPagedCodeSelect($('#subject-taxonomic-name'), {codes: 'subjecttaxonomicname'}, select2Options);
	PORTAL.VIEWS.createCodeSelect($('#assemblage'), {model: PORTAL.MODELS.assemblage}, select2Options);
	PORTAL.VIEWS.createPagedCodeSelect($('#project-code'), {codes: 'project'}, select2Options);

	// Add input validations and reformatting handlers
	PORTAL.VIEWS.inputValidation({
		inputEl: $('#siteid'),
		validationFnc: PORTAL.validators.siteIdValidator
	});
	PORTAL.VIEWS.inputValidation({
		inputEl: $('#startDateLo'),
		validationFnc: PORTAL.dateValidator.validate,
		updateFnc: function (value) {
			return PORTAL.dateValidator.format(value, true);
		}
	});
	PORTAL.VIEWS.inputValidation({
		inputEl: $('#startDateHi'),
		validationFnc: PORTAL.dateValidator.validate,
		updateFnc: function (value) {
			return PORTAL.dateValidator.format(value, false);
		}
	});
	PORTAL.VIEWS.inputValidation({
		inputEl: $('#bounding-box input[type="text"]'),
		validationFnc: PORTAL.validators.realNumberValidator
	});
	PORTAL.VIEWS.inputValidation({
		inputEl: $('#point-location input[type="text"]'),
		validationFnc: PORTAL.validators.realNumberValidator
	});
	PORTAL.VIEWS.inputValidation({
		inputEl: $('#huc'),
		validationFnc: PORTAL.hucValidator.validate,
		updateFnc: PORTAL.hucValidator.format
	});

	// Create help popovers which close when you click anywhere else other than another popover trigger.
	$('html').click(function (e) {
		$('.popover-help').popover('hide');
	});
	$('.popover-help').each(function () {
		var options = $.extend({}, PORTAL.MODELS.help[($(this).data('help'))], {
			html: true,
			trigger: 'manual'
		});
		$(this).popover(options).click(function (e) {
			$(this).popover('toggle');
			e.stopPropagation();
		});
	});

	// Add Click handler for form show/hide/button
	$('.panel-heading .show-hide-toggle').click(function () {
		PORTAL.UTILS.toggleShowHideSections($(this), $(this).parents('.panel').find('.panel-body'));
	});

	$('.subpanel-heading .show-hide-toggle').click(function () {
		PORTAL.UTILS.toggleShowHideSections($(this), $(this).parents('.subpanel').find('.subpanel-body'));
	});

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
		var fileFormat = 'xml';
		var showMap = function (totalCount) {
			// Show the map if it is currently hidden
			if ($('#query-map-box').is(':hidden')) {
				$('#mapping-div .show-hide-toggle').click();
			}

			_gaq.push(['_trackEvent', 'Portal Map', 'MapCreate', decodeURIComponent(PORTAL.queryServices.getQueryParams()), parseInt(totalCount)]);
			// Start mapping process by disabling the show site button and then requesting the layer
			$('#show-on-map-button').attr('disabled', 'disabled').removeClass('query-button').addClass('disable-query-button');
			var formParams = PORTAL.UTILS.getFormValues($('#params'),
				['north', 'south', 'east', 'west', 'resultType', 'source', 'project_code', 'nawqa_project', 'mimeType', 'zip', '__ncforminfo' /*input is injected by barracuda firewall*/],
				true
			);
			PORTAL.portalDataMap.showDataLayer(formParams, function () {
				$('#show-on-map-button').removeAttr('disabled').removeClass('disable-query-button').addClass('query-button');
			});
		};

		if (!PORTAL.CONTROLLERS.validateDownloadForm()) {
			return;
		}

		_gaq.push(['_trackEvent', 'Portal Map', 'MapCount', decodeURIComponent(PORTAL.queryServices.getQueryParams())]);

		PORTAL.downloadProgressDialog.show('map');
		PORTAL.queryServices.getHeadRequest('Station').done(function (response) {
			var counts = PORTAL.DataSourceUtils.getCountsFromHeader(response, PORTAL.MODELS.providers.getIds());

			PORTAL.downloadProgressDialog.updateProgress(counts, 'Station', fileFormat, showMap);

		}).fail(function (message) {
			PORTAL.downloadProgressDialog.cancelProgress(message);
		});
	});

	// Set up the Download button
	$('#main-button').click(function (event) {
		var startDownload = function (totalCount) {
			_gaq.push(['_trackEvent', 'Portal Page', $('#params input[name="resultType"]').val() + 'Download', decodeURIComponent(PORTAL.queryServices.getQueryParams()), parseInt(totalCount)]);
			$('#params').submit();
		};
		var fileFormat = $('input[name="mimeType"]').val();
		var resultType = $('#params input[name="resultType"]').val();

		if (!PORTAL.CONTROLLERS.validateDownloadForm()) {
			return;
		}

		event.preventDefault();
		_gaq.push(['_trackEvent', 'Portal Page', resultType + 'Count', decodeURIComponent(PORTAL.queryServices.getQueryParams())]);

		PORTAL.downloadProgressDialog.show('download');
		PORTAL.queryServices.getHeadRequest(resultType).done(function (response) {
			var counts = PORTAL.DataSourceUtils.getCountsFromHeader(response, PORTAL.MODELS.providers.getIds());

			PORTAL.downloadProgressDialog.updateProgress(counts, resultType, fileFormat, startDownload);

		}).fail(function (message) {
			PORTAL.downloadProgressDialog.cancelProgress(message);
		});
	});

	// GeoLocation easter egg. Most of code copied from Head First HTML5
	function updateMyLocation() {
		if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
			navigator.geolocation.getCurrentPosition(updateFormLocation, displayError, {
				timeout: 8000,
				maximumAge: 60000
			});
		} else {
			alert("Sorry! your browser does not support geolocation.");
		}
		return false;
	}

	function updateFormLocation(position) {
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
		if (error.code === 0 || error.code === 2) {
			errorMessage = errorMessage + " " + error.message;
		}
		alert(errorMessage);
	}

	// only give user the option if their browser supports geolocation
	if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
		$('#useMyLocation').html('<button class="btn btn-info" type="button">Use my location</button>');
		$('#useMyLocation button').click(function () {
			updateMyLocation();
		});
	}

	// Toggle the sensitivity of the Samples buttons if KML check button is clicked and update the hidden form input
	$('#download-box input[name="mimeType"]:radio').click(function () {
		var sensitive = !($('#download-box #kml').prop('checked'));

		PORTAL.UTILS.setEnabled($('#download-box #samples'), sensitive);
		PORTAL.UTILS.setEnabled($('#download-box #biosamples'), sensitive);
		$('#params input[name="mimeType"]:hidden').val($(this).val());
	});

	// Toggle the sensitivity of the KML button if Samples buttons clicked.
	// Update the form's action url.
	// Toggle the sensitivity of the Show Sites on map button

	$('#download-box input[name=resultType]').click(function () {
		var $form = $('#params');
		var $biosamplesRadio = $('#download-box #biosamples');
		var sensitive = !($('#download-box #samples').prop('checked')) && !($biosamplesRadio.prop('checked'));

		PORTAL.UTILS.setEnabled($('#download-box #kml'), sensitive);

		$form.attr('action', PORTAL.queryServices.getFormUrl($(this).val()));
		$form.find('input[name="resultType"]:hidden').val($(this).val());

		// If biological results desired add a hidden input, otherwise remove it.
		if ($biosamplesRadio.prop('checked')) {
			if ($form.find('input[name="dataProfile"]').length === 0) {
				$form.append('<input type="hidden" name="dataProfile" value="biological" />');
			}
		} else {
			$form.find('input[name="dataProfile"]').remove();
		}
	});

	//Update the sorted checkbox hidden input when changed
	$('#sorted').change(function () {
		var $hidden = $('#params input[name="sorted"]');
		if ($(this).is(':checked')) {
			$hidden.val('yes');
		}
		else {
			$hidden.val('no');
		}
	});

	//Update bBox hidden input if any of the bounding box text fields are updated
	$('#bounding-box input').change(function () {
		var north = $('#north').val();
		var south = $('#south').val();
		var east = $('#east').val();
		var west = $('#west').val();
		var bboxVal = '';
		if ((north) && (south) && (east) && (west)) {
			bboxVal = west + ',' + south + ',' + east + ',' + north;
		}
		$('#params input[name="bBox"]').val(bboxVal);
	});

	//Update the project hidden input if the project-code input  or nawqa-project input changes
	$('#project-code, #nawqa-project').change(function () {
		var nawqaValues = '';
		var projectCodes = [];
		var projectCodeValues;

		var d = $('#project-code').select2('data');
		$.each($('#project-code').select2('data'), function (index, el) {
			projectCodes.push(el.id);
		});
		projectCodeValues = projectCodes.join(';');

		if ($('#nawqa-project').is(':checked')) {
			nawqaValues += Config.NAWQA_ONLY_PROJECTS;
		}

		if (nawqaValues !== '' && projectCodeValues !== '') {
			nawqaValues += ';';
		}

		$('#params input[name="project"]').val(nawqaValues + projectCodeValues);
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
};

