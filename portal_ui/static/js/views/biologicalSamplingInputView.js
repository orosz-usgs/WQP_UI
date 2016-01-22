/* jslint browser: true */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a sampling parameter input view
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the biological sampling parameter inputs are contained
 * 		@prop {PORTAL.MODELS.cachedCodes} assemblageModel
 * @return {Object}
 *	 	@func initialize
 */
PORTAL.VIEWS.biologicalSamplingInputView = function(options) {
	"use strict";

	var self = {};

	/*
	 * Initialize select2's and set up any DOM event handlers
	 */
	self.initialize = function() {
		var $assemblage = options.$container.find('#assemblage');
		var $taxonomicName = options.$container.find('#subject-taxonomic-name');
		options.assemblageModel.fetch().done(function() {
			PORTAL.VIEWS.createCodeSelect($assemblage, {model : options.assemblageModel});
		});
		PORTAL.VIEWS.createPagedCodeSelect($taxonomicName, {codes: 'subjecttaxonomicname'},
			{closeOnSelect : false}
		);
	};

	return self;
};
