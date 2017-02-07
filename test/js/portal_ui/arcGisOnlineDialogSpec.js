/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, jasmine, spyOn */
/* global $ */
/* global PORTAL */

describe('Tests for PORTAL.Views.arcGisOnlineDialog', function() {
	"use strict"
	var thisDialog;

	beforeEach(function() {
		$('body').append('<div id=arcgis-help-dialog class="modal">' +
			'<div class="modal-content">' +
			'<div class="modal-dialog">' +
			'<div class="modal-header"><h4></h4></div>' +
			'<div class="modal-body"></div>' +
			'<div class="modal-footer"></div>' +
			'</div></div></div>'
		);
		thisDialog = PORTAL.VIEWS.arcGisOnlineDialog($('#arcgis-help-dialog'));
	});

	afterEach(function() {
		$('#arcgis-help=dialog').remove();
	});
});