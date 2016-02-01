/* jslint browser: true */
/* global _gaq */
/* global $ */
/* global PortalDataMap */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};
/*
 * Managed the Site map and its controls.
 * @param {Object} options
 * 		@param {Jquery element} $container - contains the map and its controls
 * 		@param {PORTAL.VIEWS.downloadProgressDialog} downloadProgressDialog
 * 		@param {IdentifyDialog} identifyDialog
 * 		@param {PORTAL.VIEWS.downloadFormView} downloadFormView
 * @return {Object}
 	* 	@func initialize
 */
PORTAL.VIEWS.siteMapView = function(options) {
	"use strict";

	var self = {};

	var mapId = 'query-results-map';

	var portalDataMap; // Don't initialize until the map is shown

	self.initialize = function() {
		var $mapContainer = options.$container.find('#query-map-container');
		var $map = options.$container.find('#' + mapId);
		var $showHideBtn = options.$container.find('.show-hide-toggle');

		// The map div's height should always be set to the height its parent div.
		// OpenLayers will not draw the layer if the height of the map div is not set explictly.
		$map.height($mapContainer.height());
		$(window).resize(function() {
			var mapContainerHeight = $mapContainer.height();

			if (mapContainerHeight !== $map.height()) {
				$map.height(mapContainerHeight);
			}
		});

		// Add click handler for map show/hide button
		$showHideBtn.click(function() {
			var isVisible = PORTAL.UTILS.toggleShowHideSections($(this), $mapContainer);

			if (isVisible && (!portalDataMap)) {
				portalDataMap = new PortalDataMap(mapId, options.identifyDialog);
			}
		});

		// Add click handler for Show Sites button
		options.$container.find('#show-on-map-button').click(function () {
			var queryParamArray = options.downloadFormView.getQueryParamArray();
			var queryString = PORTAL.UTILS.getQueryString(queryParamArray);

			var showMap = function (totalCount) {
				// Show the map if it is currently hidden
				if ($mapContainer.is(':hidden')) {
					$showHideBtn.click();
				}

				_gaq.push([
					'_trackEvent',
					'Portal Map',
					'MapCreate',
					decodeURIComponent(queryString),
					parseInt(totalCount)
				]);
				// Start mapping process by disabling the show site button and then requesting the layer
				$(this).attr('disabled', 'disabled').removeClass('query-button').addClass('disable-query-button');
				portalDataMap.showDataLayer(queryParamArray, function () {
					$(this).removeAttr('disabled').removeClass('disable-query-button').addClass('query-button');
				});
			};

			if (!options.downloadFormView.validateDownloadForm()) {
				return;
			}

			_gaq.push([
				'_trackEvent',
				'Portal Map',
				'MapCount',
				decodeURIComponent(queryString)
			]);

			options.downloadProgressDialog.show('map');
			PORTAL.queryServices.fetchHeadRequest('Station', queryString).done(function (response) {
				var fileFormat = 'xml';
				var counts = PORTAL.DataSourceUtils.getCountsFromHeader(response, PORTAL.MODELS.providers.getIds());

				options.downloadProgressDialog.updateProgress(counts, 'Station', fileFormat, showMap);

			}).fail(function (message) {
				options.downloadProgressDialog.cancelProgress(message);
			});
		});
	};

	return self;
};