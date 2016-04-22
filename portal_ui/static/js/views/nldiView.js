/* jslint browser: true */
/* global L */
/* global $ */
/* global _ */
/* global log */
/* global Config */

var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

/*
 * Creates the NHLD maps, an inset map and a larger map. Only one of the maps is shown.
 * The map shown is changed by clicking the expand/collapse control in the upper right of each map.
 * Each map also contains the Navigation selector.
 * @param {Object} options
 * 		@prop {String} insetMapDivId
 * 		@prop {String} mapDivId
 * 		@prop {Jquery element} $siteInputContainer
 */
PORTAL.VIEWS.nldiView  = function(options) {
	"use strict";

	var self = {};

	var comid = '';
	var comidLatLng;
	var siteIds = [];

	var navValue = '';
	var distanceValue = '';

	var insetMap, map;
	var $mapDiv = $('#' + options.mapDivId);
	var $insetMapDiv = $('#' + options.insetMapDivId);

	var nldiSiteLayers, nldiFlowlineLayers;
	var insetNldiSiteLayers, insetNldiFlowlineLayers;

	var cleanUpMapsAndSites = function() {
		if (nldiSiteLayers) {
			map.removeLayer(nldiSiteLayers);
		}
		if (nldiFlowlineLayers) {
			map.removeLayer(nldiFlowlineLayers);
		}
		if (insetNldiSiteLayers) {
			insetMap.removeLayer(insetNldiSiteLayers);
		}
		if (insetNldiFlowlineLayers) {
			insetMap.removeLayer(insetNldiFlowlineLayers);
		}

		siteIds = [];
		options.$siteInputContainer.html('');
	};

	var updateNldiSitesInputs = function(newSites) {
		var addInput = function(memo, siteId) {
			return memo + '<input type="hidden" name="siteid" value="' + siteId + '" />';
		};
		var htmlInputs = _.reduce(newSites, addInput, '');

		options.$siteInputContainer.html(htmlInputs);
	};


	/*
	 * @param {L.LatLngBounds} bounds - Looking for a com id within bounds
	 * @returns $Deferred.promise
	 * 		@resolve - Returns {Object} with {Number} totalFeatures property and {String} comid property. The comId will be the first one returned or the
	 * 			empty string if no features were found.
	 * 		@reject	- If unable to fetch the comid
	 */
	var fetchComid = function(bounds) {
		var deferred  = $.Deferred();

		L.esri.Tasks.query({
			url : Config.NLDI_COMID_ENDPOINT
		})
			.intersects(bounds)
			.layer(1)
			.fields(['COMID'])
			.run(function(error, featureCollection) {
				if (error) {
					deferred.reject();
					log.error('Unable to retrieve comids from service ' + Config.NLDI_COMID_ENDPOINT);
				}
				else {
					deferred.resolve({
						totalFeatures : featureCollection.features.length,
						comid : (featureCollection.features.length > 0) ? featureCollection.features[0].properties.COMID : ''
					});
				}
			});

		return deferred.promise();
	};

	/*
	 * @param {String} comId
	 * @param {String navigate
	 * @returns $.jqXHR object
	 */
	var fetchNldiSites = function(comid, navigate, distance) {
		return $.ajax({
			url : Config.NLDI_SERVICES_ENDPOINT + 'comid/' + comid + '/navigate/' + navigate + '/wqp',
			method : 'GET',
			data : {
				distance : distance
			}
		});

	};

	/*
	 * @param {String} comId
	 * @param {String navigate
	 * @returns $.jqXHR object
	 */
	var fetchNldiFlowlines = function(comid, navigate, distance) {
		return $.ajax({
			url : Config.NLDI_SERVICES_ENDPOINT + 'comid/' + comid + '/navigate/' + navigate,
			method : 'GET',
			data : {
				distance : distance
			}
		});
	};

	var updateNldiSites = function(comid, navigate, distance) {
		var flowlineLayer = _.partial(L.geoJson);
		var siteLayer = _.partial(L.geoJson, _, {
			pointToLayer: function (featureData, latlng) {
				return L.circleMarker(latlng, {
					radius: 5,
					fillColor: "#ff3300",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			}
		});

		if ((comid) && (navigate)) {
			$mapDiv.css('cursor', 'progress');
			$.when(fetchNldiSites(comid, navigate, distance), fetchNldiFlowlines(comid, navigate, distance))
				.done(function (sitesGeojson, flowlinesGeojson) {
					var flowlineBounds;

					map.closePopup();

					nldiFlowlineLayers = flowlineLayer(flowlinesGeojson);
					insetNldiFlowlineLayers = flowlineLayer(flowlinesGeojson);
					map.addLayer(nldiFlowlineLayers);
					insetMap.addLayer(insetNldiFlowlineLayers);

					flowlineBounds = nldiFlowlineLayers.getBounds();
					map.fitBounds(flowlineBounds);

					if (sitesGeojson[0].features.length < 1000) {
						nldiSiteLayers = siteLayer(sitesGeojson);
						insetNldiSiteLayers = siteLayer(sitesGeojson);

						map.addLayer(nldiSiteLayers);
						insetMap.addLayer(insetNldiSiteLayers);

						siteIds = _.map(sitesGeojson[0].features, function (feature) {
							return feature.properties.identifier;
						});

					}
					else {
						map.openPopup('<p>The number of sites exceeds 1000 and can\'t be used to query the WQP. You may want to try searching by HUC',
							flowlineBounds.getCenter());
					}
					updateNldiSitesInputs(siteIds);
				})
				.fail(function () {
					map.openPopup('Unable to retrieve NLDI information', map.getCenter());
					updateNldiSitesInputs(siteIds);
				})
				.always(function () {
					$mapDiv.css('cursor', '');
				});
		}
	};

	/*
	 * Leaflet mouse event handler to find the sites associated with the COMID at the location in the event and displays
	 * the sites and flowlines on the nldi map. Popups are used to tell the user if an error occurred in the process.
	 *
	 * @param {L.MouseEvent} ev
	 */
	var findSitesHandler = function(ev) {
		var point = ev.layerPoint;
		var bounds = L.latLngBounds(map.layerPointToLatLng([point.x - 5, point.y + 5 ]),
			map.layerPointToLatLng([point.x + 5, point.y - 5]));

		if (navValue) {
			log.debug('Clicked at location: ' + ev.latlng.toString());
			$mapDiv.css('cursor', 'progress');
			comid = '';
			comidLatLng = undefined;

			fetchComid(bounds)
				.done(function (result) {
					log.debug('Got COMID response');

					if (result.totalFeatures === 0) {
						map.openPopup('<p>No reach has been selected. Please try at a different location.</p>', ev.latlng);
						$mapDiv.css('cursor', '');

					}
					else if (result.totalFeatures > 2) {
						map.openPopup('<p>More than one reach has been selected. Please zoom in and try again.</p>', ev.latlng);
						$mapDiv.css('cursor', '');
					}
					else {
						comid = result.comid;
						comidLatLng = ev.latlng;
						map.openPopup('<p>Successfully retrieved comid ' + result.comid + '. Retrieving sites.</p>', ev.latlng);
						updateNldiSites(comid, navValue, distanceValue);
					}
				})
				.fail(function () {
					map.openPopup('<p>Unable to retrieve comids, service call failed</p>', ev.latlng);
					$mapDiv.css('cursor', '');
				});
		}
		else {
			map.openPopup('<p>Please select a navigation direction</p>', ev.latlng);
		}
	};

	/*
	 * Show the full size map and set it's navigation select value. Hide the inset map
	 */
	var showMap = function () {
		if ($mapDiv.is(':hidden')) {
			$insetMapDiv.hide();
			$mapDiv.show();
			nldiControl.setNavValue(navValue);
			nldiControl.setDistanceValue(distanceValue);
			map.invalidateSize();
			map.setView(insetMap.getCenter(), insetMap.getZoom());
		}
		map.closePopup();
	};

	/*
	 * Show the inset map and set it's navigation select value. Hide the full size map
	 */
	var showInsetMap = function () {
		if ($insetMapDiv.is(':hidden')) {
			$insetMapDiv.show();
			$mapDiv.hide();
			insetNldiControl.setNavValue(navValue);
			insetNldiControl.setDistanceValue(distanceValue);
			insetMap.invalidateSize();
			insetMap.setView(map.getCenter(), map.getZoom());
		}
	};

	/*
	 * @param {DOM event object} ev
	 * Handle the change event for the nav selection control.
	 */
	var navChangeHandler = function(ev) {
		navValue = $(ev.target).val();
		cleanUpMapsAndSites();
		if (navValue) {
			showMap();
			if (comid) {
				map.openPopup('Retrieving sites at comid ' + comid + '.', comidLatLng);
				updateNldiSites(comid, navValue, distanceValue);
			}
		}
		else {
			showInsetMap();
		}
	};

	var distanceChangeHandler = function(ev) {
		distanceValue = $(ev.target).val();
		cleanUpMapsAndSites();

		if (navValue) {
			showMap();
			if (comid) {
				map.openPopup('Retrieving sites at comid ' + comid + '.',  comidLatLng);
				updateNldiSites(comid, navValue, distanceValue);
			}
		}
		else {
			showInsetMap();
		}
	};

	var clearHandler = function() {
		comid = '';
		navValue = '';
		distanceValue = '';

		this.setNavValue(navValue);
		this.setDistanceValue(distanceValue);
		
		cleanUpMapsAndSites();
		map.closePopup();
	};

	var insetBaseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray')
	};
	var insetHydroLayer = L.esri.tiledMapLayer({
		url : "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});

	var baseLayers = {
		'World Gray' : L.esri.basemapLayer('Gray'),
		'World Topo' : L.tileLayer.provider('Esri.WorldTopoMap'),
		'World Street' : L.tileLayer.provider('Esri.WorldStreetMap'),
		'World Relief' : L.tileLayer.provider('Esri.WorldShadedRelief'),
		'World Imagery' : L.tileLayer.provider('Esri.WorldImagery')
	};
	var hydroLayer = L.esri.tiledMapLayer({
		url : "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer"
	});
	var layerSwitcher = L.control.layers(baseLayers, {
		'Hydro Reference' : hydroLayer
	});

	var insetNldiControl = L.control.nldiControl({
		navChangeHandler : navChangeHandler,
		distanceChangeHandler : distanceChangeHandler,
		clearClickHandler : clearHandler
	});
	var nldiControl = L.control.nldiControl({
		navChangeHandler : navChangeHandler,
		distanceChangeHandler : distanceChangeHandler,
		clearClickHandler : clearHandler
	});

	var expandControl = L.easyButton('fa-lg fa-expand', showMap, 'Expand NLDI Map', {
		position : 'topright'
	});
	var collapseControl = L.easyButton('fa-lg fa-compress', showInsetMap, 'Collapse NLDI Map', {
		position: 'topright'
	});

	var MapWithSingleClickHandler = L.Map.extend({
		includes : L.SingleClickEventMixin
	});

	/*
	 * Initialize the inset and full size maps.
	 */
	self.initialize = function() {
		insetMap = L.map(options.insetMapDivId, {
			center: [37.0, -100.0],
			zoom : 3,
			layers : [insetBaseLayers['World Gray']],
			zoomControl : false
		});
		insetMap.addLayer(insetHydroLayer);
		insetMap.addControl(expandControl);
		insetMap.addControl(insetNldiControl);
		insetMap.addControl(L.control.zoom());

		map = new MapWithSingleClickHandler(options.mapDivId, {
			center: [37.0, -100.0],
			zoom : 3,
			layers : [baseLayers['World Gray'], hydroLayer],
			zoomControl : false
		});
		map.addControl(collapseControl);
		map.addControl(layerSwitcher);
		map.addControl(nldiControl);
		map.addControl(L.control.zoom());

		map.addSingleClickHandler(findSitesHandler);
	};

	return self;
};