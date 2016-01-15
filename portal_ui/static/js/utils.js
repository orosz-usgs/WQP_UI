/* jslint browser: true */
/* global $ */
/* global _ */
/* global Config */
/* global Handlebars */

var PORTAL = PORTAL || {};
PORTAL.UTILS = function() {
	"use strict";
	var self = {};

	var CHECKBOX_SOURCE = '<input type="checkbox" id="{{id}}" class="{{className}}" value="{{value}}" />' +
		'<label for="{{id}}">{{value}}</label>';
	var checkboxTemplate = Handlebars.compile(CHECKBOX_SOURCE);

	/*
	 * Set the state of the checkboxes in elements to state
	 * @param {Array of jquery elements} $els
	 * @param {Boolean} state
	 */
	self.setCheckboxState = function($els, state ) {
		$els.prop('checked', state);
	};

	/*
	 * Set the state of the tri-state checkbox elements to indeterminate or if that is false to state
	 * @param {Array of jquery elements} $els
	 * @param {Boolean} indeterminate
	 * @param {Boolean} state
	 */
	self.setCheckboxTriState = function($els, indeterminate, state) {
		if (indeterminate) {
			$els.prop('indeterminate', true);
		}
		else {
			$els.prop('indeterminate', false);
			self.setCheckboxState($els, state);
		}
	};

	/*
	 * Generate the html to represent a checkbox
	 * @param {String} id
	 * @param {String} className
	 * @param {String} value
	 */
	self.getCheckBoxHtml = function(id, className, value) {
		return checkboxTemplate({id : id, className: className, value: value});
	};

	/*
	 * Returns an array of objects representing the query in $form with the parameters in ignoreList and empty
	 * parameters removed.
	 * @param {Jquery form element} $form
	 * @param {Array of String} ignoreList - parameter names that should be removed from the returned array.
	 * @param {Boolean} multiSelectDelimited - if true multi selects are represented by a single key with ';' separated values
	 * @return {Array of Object} - each object has name and value properties.
	 */
	self.getFormValues = function($form, ignoreList, multiSelectDelimited) {
		var isValidParam = function (param) {
			return ((param.value) && (!_.contains(ignoreList, param.name)))
		};
		var results = [];

		if (multiSelectDelimited) {
			var $nonMultiSelects = $form.find('input[name], textarea[name], select[name]:not([multiple])');
			var $multiSelects = $form.find('select[name][multiple]');
			var multiSelectResults = _.map($multiSelects, function (el) {
				var val = $(el).val();
				return {
					name: el.name,
					value: (val) ? val.join(';') : ''
				};
			});
			results = $nonMultiSelects.serializeArray().concat(multiSelectResults);
		}
		else {
			results = $form.serializeArray();
		}
		return _.filter(results, isValidParam);
	};

	/*
	 * @param {Jquery form element $form
	 * @param {Array of String} ignoreList - parameter names that should be removed from the returned string
	 * @param {Boolean} multiSelectDelimited - if true multi selects are represented by a single key with ';' separated values
	 * @return {String} - represents the query in $form with parameters on ignoreList and that are empty removed.
	 */
	self.getFormQuery = function($form, ignoreList, multiSelectDelimited) {
		return $.param(self.getFormValues($form, ignoreList, multiSelectDelimited));
	};

	/*
	 * Add/Remove the disabled attribute for $els and make the element appear enabled/disabled.
	 * @param {Array of jquery input elements} $els
	 * @param {Boolean} isEnabled
	 */
	self.setEnabled = function($els, isEnabled /* Boolean */) {
		$els.prop('disabled', !isEnabled);
		$els.each(function() {
			var $label = $('label[for="' + $(this).attr('id') + '"]');
			if (isEnabled) {
				$label.removeClass('disabled');
			}
			else {
				$label.addClass('disabled');
			}
		});
	};

	/*
	 * @param {Jquery element} $button - The show/hide toggle button jquery element
	 * @param {Jquery element} $contentDiv - The content div that is controlled by buttonEl.
	 * @return {Boolean} - true if contentDivEl is now visible, false otherwise.
	 */
	self.toggleShowHideSections = function($button, $contentDiv) {
		var $buttonImg = $button.find('img');
		if ($buttonImg.attr('alt') === 'show') {
			$button.attr('title', $button.attr('title').replace('Show', 'Hide'));
			$buttonImg.attr('alt', 'hide').attr('src', Config.STATIC_ENDPOINT + 'img/collapse.png');
			$contentDiv.slideDown();
			return true;
		}
		else {
			$button.attr('title', $button.attr('title').replace('Hide', 'Show'));
			$buttonImg.attr('alt', 'show').attr('src', Config.STATIC_ENDPOINT + 'img/expand.png');
			$contentDiv.slideUp();
			return false;
		}
	};
	return self;
}();