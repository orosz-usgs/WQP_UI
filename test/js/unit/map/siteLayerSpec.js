/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn, jasmine */
/* global sinon */
/* global PORTAL */
/* global Config */

describe('PORTAL.MAP.siteLayer tests', function() {
	"use strict";

	var fakeServer;
	beforeEach(function() {
		fakeServer = sinon.fakeServer.create();
	});

	afterEach(function() {
		fakeServer.restore();
	});

	describe('Tests for createWQPSitesLayer', function() {
		var testLayer;

		var queryParamArray = [{name : 'param1', value: 'value1'}, {name : 'param2', value: 'value2'}];
		var wmsParams = {'wmsParam' : 'value3'};
		var layerOptions = {'fakeProp' : 'value4'};


		beforeEach(function() {
			testLayer = PORTAL.MAP.siteLayer.createWQPSitesLayer(queryParamArray, wmsParams, layerOptions);
		});

		it('Expects that a WMS tile source has been created and that the SEARCHPARAMS property is set', function() {
			var source = testLayer.getSource();
			expect(source.getUrls()[0]).toContain(Config.SITES_GEOSERVER_ENDPOINT);
			expect(source.getParams().SEARCHPARAMS).toEqual('param1:value1;param2:value2');
		});

		it('Expects that the queryParamArray is defined as a property on the layer', function() {
			expect(testLayer.getProperties().queryParamArray).toEqual(queryParamArray);
		});

		it('Expects that any additional wmsParams passed in are passed to the source', function() {
			var source = testLayer.getSource();
			expect(source.getParams().wmsParam).toEqual('value3');
		});

		it('Expects that additional layer options are set as a property on the layer', function() {
			expect(testLayer.getProperties().fakeProp).toEqual('value4');
		});

		it('Expects the source to emit a sourceloaded event after tileloading has started and ended', function() {
			var source = testLayer.getSource();
			var loadedSpy = jasmine.createSpy();
			source.on('sourceloaded', loadedSpy);

			source.dispatchEvent('tileloadstart');
			source.dispatchEvent('tileloadstart');
			source.dispatchEvent('tileloadstart');


			source.dispatchEvent('tileloadend');
			expect(loadedSpy).not.toHaveBeenCalled();
			source.dispatchEvent('tileloaderror');
			expect(loadedSpy).not.toHaveBeenCalled();
			source.dispatchEvent('tileloadend');
			expect(loadedSpy).toHaveBeenCalled();
		});


	});

	describe ('Tests for updateWQPSitesLayer', function() {
		var testLayer;

		var queryParamArray = [{name : 'param1', value: 'value1'}, {name : 'param2', value: 'value2'}];
		var wmsParams = {'wmsParam' : 'value3'};
		var layerOptions = {'fakeProp' : 'value4'};


		beforeEach(function() {
			testLayer = PORTAL.MAP.siteLayer.createWQPSitesLayer(queryParamArray, wmsParams, layerOptions);
		});

		it('Expects that the layer\'s source and layer\'s properties reflect the updated queryParamArray', function() {
			queryParamArray.push({name : 'param3', value: 'value3'});
			PORTAL.MAP.siteLayer.updateWQPSitesLayer(testLayer, queryParamArray);

			expect(testLayer.getProperties().queryParamArray).toEqual(queryParamArray);
			expect(testLayer.getSource().getParams().SEARCHPARAMS).toEqual('param1:value1;param2:value2;param3:value3');
		});
	});

	describe('Tests for getWfsGetFeatureUrl', function() {
		var queryParamArray = [{name: 'statecode', value: 'US:55'}, {name: 'countycode', value: 'US:55:025'}];

		it('Expects the queryParamArray to be formatted into a semicolon separated value', function() {
			var urlString = PORTAL.MAP.siteLayer.getWfsGetFeatureUrl(queryParamArray);
			expect(urlString).toContain('searchParams=' + encodeURIComponent('statecode:US:55;countycode:US:55:025'));
		});
	});

	describe('Tests for getWQPSitesFeature', function() {
		var queryParamArray = [{name: 'statecode', value: 'US:55'}, {name: 'countycode', value: 'US:55:025'}];
		var boundingBox = [-9955464,  5315278, -9949960, 5319405];

		var getFeaturePromise;
		var successSpy;
		var failedSpy;

		beforeEach(function() {
			successSpy = jasmine.createSpy('successSpy');
			failedSpy  = jasmine.createSpy('failedSpy');
			getFeaturePromise = PORTAL.MAP.siteLayer.getWQPSitesFeature(queryParamArray, boundingBox).done(successSpy).fail(failedSpy);
		});

		it('Expects that a POST call is made to the WFS geoserver endpoint', function() {
			expect(fakeServer.requests[0].url).toContain(Config.SITES_GEOSERVER_ENDPOINT);
			expect(fakeServer.requests[0].url).toContain('wfs');
			expect(fakeServer.requests[0].method).toEqual('POST');
		});

		it('Expects that the payload include the queryParamArray and bounding box properly formatted', function() {
			var requestBody = fakeServer.requests[0].requestBody;
			expect(requestBody).toContain('<PropertyIsEqualTo matchCase="true"><PropertyName>searchParams</PropertyName><Literal>statecode%3AUS%3A55%3Bcountycode%3AUS%3A55%3A025</Literal></PropertyIsEqualTo>');
			expect(requestBody).toContain('<BBOX xmlns="http://www.opengis.net/ogc"><PropertyName>the_geom</PropertyName><Envelope xmlns="http://www.opengis.net/gml" srsName="EPSG:900913"><lowerCorner>-9955464 5315278</lowerCorner><upperCorner>-9949960 5319405</upperCorner></Envelope></BBOX>');
		});

		it('Expects a successful response without an exception to resolve the promise', function() {
			fakeServer.respondWith([200, {"Content-Type": "text/xml"},
				'<wfs:FeatureCollection xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:qw_portal_map="http://www.waterqualitydata.us/ogcservices" xmlns:wfs="http://www.opengis.net/wfs" ' +
				'xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:ows="http://www.opengis.net/ows" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
				'numberOfFeatures="1" timeStamp="2016-02-17T15:50:09.401Z" xsi:schemaLocation="http://www.opengis.net/wfs http://cida-eros-wqpdev.er.usgs.gov:8080//ogcproxy/schemas/wfs/1.1.0/wfs.xsd ' +
				'http://www.waterqualitydata.us/ogcservices http://cida-eros-wqpdev.er.usgs.gov:8080//ogcproxy/wfs?service=WFS&amp;version=1.1.0&amp;request=DescribeFeatureType&amp;typeName=qw_portal_map%3AdynamicSites_1944937540">' +
				'<gml:boundedBy><gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#900913"><gml:lowerCorner>-9976133.2779546 5350760.879190248</gml:lowerCorner>' +
				'<gml:upperCorner>-9976133.2779546 5350760.879190248</gml:upperCorner></gml:Envelope></gml:boundedBy><gml:featureMembers></gml:featureMembers></wfs:FeatureCollection>'
			]);
			fakeServer.respond();
			expect(successSpy).toHaveBeenCalled();
			expect(failedSpy).not.toHaveBeenCalled();
		});

		it('Expects a successful response with an exception to reject the promise', function() {
			fakeServer.respondWith([200, {"Content-Type": "text/xml"},
				'<ows:ExceptionReport xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/ows http://cida-eros-wqpdev.er.usgs.gov:8080//ogcproxy/schemas/ows/1.0.0/owsExceptionReport.xsd">' +
  				'<ows:Exception exceptionCode="InvalidParameterValue">' +
    			'<ows:ExceptionText>Illegal property name: the_geo for feature type qw_portal_map:dynamicSites_1944937540</ows:ExceptionText>' +
  				'</ows:Exception>' +
				'</ows:ExceptionReport>'
			]);
			fakeServer.respond();
			expect(successSpy).not.toHaveBeenCalled();
			expect(failedSpy).toHaveBeenCalled();
		});

		it('Expects a failed response to rejct the promise', function() {
			fakeServer.respondWith([500, {"Content-Type" : "text"}, 'Bad server']);
			fakeServer.respond();
			expect(successSpy).not.toHaveBeenCalled();
			expect(failedSpy).toHaveBeenCalled();
		});
	});
});
