/* jslint browser: true */
/* global describe, beforeEach, afterEach, it, expect, spyOn */
/* global L */


fdescribe('leafletControl/QuerySelectControl', function() {
	"use strict";

	var map;
	var testControl;
	var layer1, layer2;

	beforeEach(function() {
		document.body.innerHTML = '<div id="test-div" style="height: 30px; width: 30px;"></div>';
		map = L.map('test-div', {
			center : [43.0, -100.0],
			zoom: 4
		});

		layer1 = L.circleMarker([43.1, -100.1]);
		layer2 = L.circleMarker([43.2, -100.2]);
		testControl = L.control.querySelectControl({
			queryOptions: [
				{id: 'query1', text: 'Text1', layer: layer1},
				{id: 'query2', text: 'Text2', layer: layer2}
			]
		});
		map.addControl(testControl);
	});

	afterEach(function() {
		if (testControl._map) {
			map.removeControl(testControl);
		}
		document.body.innerHTML = '';
	});

	it('Expects that the map contains a select control containing the query options', function() {
		var select = document.getElementsByClassName('leaflet-nldi-query-control-div');
		var options;

		expect(select.length).toBe(1);
		options = select[0].getElementsByTagName('option');
		expect(options.length).toBe(3);
		expect(options[0].value).toEqual('');
		expect(options[1].value).toEqual('query1');
		expect(options[2].value).toEqual('query2');
	});

	it('Expects that the getValue method returns the current value selected', function() {
		var select = document.getElementsByClassName('leaflet-nldi-query-picker')[0];

		expect(testControl.getValue()).toEqual('');

		select.value = 'query1';
		expect(testControl.getValue()).toEqual('query1');
	});

	it('Expects that the change handler adds the selected layer to the map', function() {
		var select = document.getElementsByClassName('leaflet-nldi-query-picker')[0];
		var event = document.createEvent('HTMLEvents');

		select.value='query1';
		event.initEvent('change', true, false);
		select.dispatchEvent(event);

		expect(map.hasLayer(layer1)).toBe(true);
		expect(map.hasLayer(layer2)).toBe(false);
	});

	it('Expects that the second call to the change handler removes the first layer and adds the second to the map', function() {
		var select = document.getElementsByClassName('leaflet-nldi-query-picker')[0];
		var event = document.createEvent('HTMLEvents');

		select.value='query1';
		event.initEvent('change', true, false);
		select.dispatchEvent(event);

		select.value='query2';
		event.initEvent('change', true, false);
		select.dispatchEvent(event);

		expect(map.hasLayer(layer1)).toBe(false);
		expect(map.hasLayer(layer2)).toBe(true);
	});

	it('Expects that removing the control removes the change event listener', function() {
		spyOn(L.DomEvent, 'removeListener').and.callThrough();

		map.removeControl(testControl);

		expect(L.DomEvent.removeListener).toHaveBeenCalled();
	});

	it('Expects that removing the control removes the displayed query layer', function() {
		var select = document.getElementsByClassName('leaflet-nldi-query-picker')[0];
		var event = document.createEvent('HTMLEvents');

		select.value='query1';
		event.initEvent('change', true, false);
		select.dispatchEvent(event);
		map.removeControl(testControl);

		expect(map.hasLayer(layer1)).toBe(false);
	});
});