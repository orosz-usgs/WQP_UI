/* jslint browser: true */
/* global $ */

var PORTAL = window.PORTAL = window.PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Manages the data detail inputs view
 * @param {Object} options
 * 		@prop {Jquery element} $container - The div where the data detail inputs are contained
 * 		@func updateResultTypeAction - called whenever the result-type radio buttons are changed
 * 			@param {String} resultType - the checked radio button's value
 * @return {Object}
 * 		@func initialize
 *  	@func getResultType
 *		@func getMimeType
 */
PORTAL.VIEWS.dataDetailsView = function(options) {
	"use strict";

	var self = {};

	/*
	 * Initializes the widgets and sets up the DOM event handlers.
	 */
	self.initialize = function() {
		var $kml = options.$container.find('#kml');

		var $site = options.$container.find('#sites');
		var $biosamples = options.$container.find('#biosamples');
		var $narrowResults = options.$container.find('#narrowsamples');

		var $sorted = options.$container.find('#sorted');
		var $hiddenSorted = options.$container.find('input[type="hidden"][name="sorted"]');
		var $mimeTypeRadioboxes = options.$container.find('input[name="mimeType"]');
		var $resultTypeRadioboxes = options.$container.find('input.result-type');

		$mimeTypeRadioboxes.change(function() {
			var kmlChecked = $kml.prop('checked');

			// Can only download sites if kml is checked
			PORTAL.UTILS.setEnabled(options.$container.find('.result-type:not(#sites)'), !kmlChecked);
		});

		$resultTypeRadioboxes.change(function() {
			var resultType = $(this).val();
			var $dataProfile = options.$container.find('input[name="dataProfile"]');

			// Uncheck previously checked button
			options.$container.find('input.result-type:checked').not(this).prop('checked', false);

			PORTAL.UTILS.setEnabled($kml, $site.prop('checked'));

			// If biological results or narrow results desired add a hidden input, otherwise remove it.
			$dataProfile.remove();
			if ($biosamples.prop('checked')) {
				options.$container.append('<input type="hidden" name="dataProfile" value="biological" />');

			}
			else if ($narrowResults.prop('checked')){
				options.$container.append('<input type="hidden" name="dataProfile" value="narrowResult" />');
			}
			options.updateResultTypeAction(resultType);
		});

		$sorted.change(function() {
			var val = $(this).is(':checked') ? 'yes' : 'no';
			$hiddenSorted.val(val);
		});
	};

	self.getResultType = function() {
		return options.$container.find('input.result-type:checked').val();
	};

	self.getMimeType = function() {
		return options.$container.find('input[name="mimeType"]:checked').val();
	};

	return self;
};
