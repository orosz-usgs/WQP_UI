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

	var COLLAPSE_IMG = Config.STATIC_ENDPOINT + 'img/collapse.png';
	var EXPAND_IMG = Config.STATIC_ENDPOINT + 'img/expand.png';

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
	 * Returns a query string suitable for use as a URL query string with parameters on the ignoreList
	 * removed.
	 * @param {Array of Object} paramArray - Each object has a name property and a value property both with string values
	 * @param {Array of String} ignoreList - Names to be removed from paramArray before serializing
	 * @param {Boolean} multiSelectDelimited - if true param names that appear more than once are serialized as a single param with ';' separated values
	 * @return {String} - String suitable for use as a URL query string.
	 */
	self.getQueryString = function(paramArray, ignoreList, multiSelectDelimited) {
		var thisIgnoreList = (ignoreList) ? ignoreList : [];
		var resultArray = _.reject(paramArray, function (param) {
			return _.contains(thisIgnoreList, param.name);
		});

		if (multiSelectDelimited) {
			resultArray = _.chain(resultArray)
				.groupBy('name')
				.map(function(groupedParam, name) {
					return {
						name : name,
						value : _.pluck(groupedParam, 'value').join(';')
					};
				})
				.value();
		}
		return $.param(resultArray);
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
			$buttonImg.attr('alt', 'hide').attr('src', COLLAPSE_IMG);
			$contentDiv.slideDown();
			return true;
		}
		else {
			$button.attr('title', $button.attr('title').replace('Hide', 'Show'));
			$buttonImg.attr('alt', 'show').attr('src', EXPAND_IMG);
			$contentDiv.slideUp();
			return false;
		}
	};
	return self;
}();