var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.siteIDInputView = function (options) {
    "use strict";

	var self = {};

    var initializeSiteIDSelect = function($select, model) {
		var isMatch = function (searchTerm, lookup) {
			var termMatcher;

			if (searchTerm) {
				termMatcher = new RegExp(searchTerm, 'i');
				return (termMatcher.test(lookup.siteid));
			}
			else {
				return true;
			}
		};
		var templateSelection = function(selectData) {
			if (_.has(selectData, 'siteid')) {
				return selectData.siteid;
			}
			else {
				return null;
			}
		};

		var spec = {
			model: model,
			isMatch: isMatch
		};

		PORTAL.VIEWS.createCodeSelect($select, spec, {
			templateSelection: templateSelection
		});
	};

    /*
	 * Initialize the select2's and add event handlers
	 * @return Jquery promise
	 * 		@resolve - When all models have been fetched successfully
	 * 		@reject - If any of the fetches failed.
	 */
	self.initialize = function() {
		//Initialize select els
		var $siteIDSelect = options.$container.find('#siteid');

		//Fetch initial model data
		var fetchSiteIDs = options.siteid.fetch();
		var fetchComplete = $.when(fetchSiteIDs);

		// options.siteIDModel.fetch([USA]);

		// var getCountryKeys = function () {
		// 	var results = $countrySelect.val();
		// 	return (results.length > 0) ? results : [USA];
		// };
        //
		// var getStateKeys = function() {
		// 	var results = $stateSelect.val();
		// 	return (results.length > 0) ? results : [];
		// };

		//Initialize select2s

		fetchSiteIDs.done(function(){
			initializeSiteIDSelect($siteIDSelect, options.siteIDModel);
		});

		$siteIDSelect.on('change', function (ev) {
			var siteids = $(ev.target).val();
		});

		//Add event handlers
		// $countrySelect.on('change', function (ev) {
		// 	/* update states */
		// 	var countries = $(ev.target).val();
		// 	var states = $stateSelect.val();
		// 	var isInCountries = function(state) {
		// 		var countryCode = state.split(':')[0];
		// 		return _.contains(countries, countryCode);
		// 	};
        //
		// 	if (!countries) {
		// 		countries = [USA];
		// 	}
		// 	$stateSelect.val(_.filter(states, isInCountries)).trigger('change');
		// });
        //
		// $stateSelect.on('change', function (ev) {
		// 	var states = $(ev.target).val();
		// 	var counties = $countySelect.val();
		// 	var isInStates = function(county) {
		// 		var codes = county.split(':');
		// 		var stateCode = codes[0] + ':' + codes[1];
		// 		return _.contains(states, stateCode);
		// 	};
        //
		// 	$countySelect.val(_.filter(counties, isInStates)).trigger('change');
		// });
		// PORTAL.VIEWS.inputValidation({
		// 	inputEl : $countySelect,
		// 	validationFnc : function(val, ev) {
		// 		var result;
		// 		if (getStateKeys().length === 0) {
		// 			ev.preventDefault();
		// 			result  = {
		// 				isValid : false,
		// 				errorMessage : 'Please select at least one state'
		// 			};
		// 		}
		// 		else {
		// 			result = {
		// 				isValid : true
		// 			};
		// 		}
		// 		return result;
		// 	},
		// 	event : 'select2:opening'
		// });
        //
		return fetchComplete;
	};

	return self;
};

