/* jslint browser: true */
/* global $ */
/* Config */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates a site parameter input view object
 * @param {Object} options
 * 		@prop {Jquery element} $container - element where the site parameter inputs are contained
 * 		@prop {PORTAL.MODELS.cachedCodes} siteTypeModel
 * 		@prop {PORTAL.MODELS.cachedCodes} organizationModel
 * @returns {Object}
 * 		@func initialize;
 */
PORTAL.VIEWS.siteParameterInputView = function(options) {
	"use strict";

	var self = {};

	var initializeOrganizationSelect = function($select, model) {
		var formatData = function(data) {
			return {
				id : data.id,
				text : data.id + ' - ' + data.desc
			};
		};
		var isMatch = function(searchTerm, data) {
			var termMatcher;
			if (searchTerm) {
				termMatcher = new RegExp(searchTerm, 'i');
				return (termMatcher.test(data.id) || termMatcher.test(data.desc));
			}
			else {
				return true;
			}
		};
		PORTAL.VIEWS.createCodeSelect($select, {
			model : model,
			formatData : formatData,
			isMatch : isMatch
		}, {
			minimumInputLength: 2,
			closeOnSelect : false
		});
	};

	var initializeSiteIdSelect = function($select, getOrganization) {
		var formatData = function(data) {
			return {
				id : data.id,
				text : data.id + ' - ' + data.desc
			};
		};

		// var isMatch = function (searchTerm, lookup) {
		// 	var termMatcher;
		// 	var codes;
		// 	if (searchTerm) {
		// 		termMatcher = new RegExp(searchTerm, 'i');
		// 		codes = lookup.id;
		// 		return (termMatcher.test(lookup.id) ||
		// 			termMatcher.test(lookup.desc));
		// 	}
		// 	else {
		// 		return true;
		// 	}
		// };

		var spec = {
			// model: model,
			// isMatch: isMatch,
			getKeys: getOrganization
		};

		PORTAL.VIEWS.createPagedCodeSelect($select, {
            codes: 'monitoringlocation',
			formatData : formatData,
			}, {
            minimumInputLength: 2
        });
	};


	/*
	 * Initialize the widgets and DOM event handlers
	 * @return Jquery promise
	 * 		@resolve - when all models have been fetched successfully
	 * 	    @reject - if any model's fetch failed.
	 */
	self.initialize = function() {
		var $siteTypeSelect = options.$container.find('#siteType');
		var $organizationSelect = options.$container.find('#organization');
		var $siteIdInput = options.$container.find('#siteid');
		var $hucInput = options.$container.find('#huc');
		var $minActivitiesInput = options.$container.find('#min-activities');

		var fetchSiteType = options.siteTypeModel.fetch();
		var fetchOrganization = options.organizationModel.fetch();
		var fetchComplete = $.when(fetchSiteType, fetchOrganization);

		var getOrganization = function () {
			var results = $organizationSelect.val();
			return (results.length > 0) ? results : [];
		};

		fetchSiteType.done(function() {
			PORTAL.VIEWS.createCodeSelect($siteTypeSelect, {model : options.siteTypeModel});
		});
		fetchOrganization.done(function() {
			initializeOrganizationSelect($organizationSelect, options.organizationModel);
		});
		initializeSiteIdSelect($siteIdInput, getOrganization);

		// $organizationSelect.on('change', function (ev) {
		// 	var organization = $(ev.target).val();
		// 	var siteids = $siteIdInput.val();
		// 	// var isInStates = function(county) {
		// 	// 	var codes = county.split(':');
		// 	// 	var stateCode = codes[0] + ':' + codes[1];
		// 	// 	return _.contains(states, stateCode);
		// 	// };
         //    //
		// 	// $countySelect.val(_.filter(counties, isInStates)).trigger('change');
		// });





		// Add event handlers
		PORTAL.VIEWS.inputValidation({
			inputEl: $siteIdInput,
			validationFnc: PORTAL.validators.siteIdValidator
		});
		PORTAL.VIEWS.inputValidation({
			inputEl: $hucInput,
			validationFnc: PORTAL.hucValidator.validate,
			updateFnc: PORTAL.hucValidator.format
		});
		PORTAL.VIEWS.inputValidation({
			inputEl : $minActivitiesInput,
			validationFnc : PORTAL.validators.positiveIntValidator
		});

		return fetchComplete;
	};

	return self;
};


