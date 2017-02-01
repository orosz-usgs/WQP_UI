/* jslint browser: true */
/* global L */
/* global _ */

/*
 * @constructs
 * @param {Object} options
 * 		@prop {String} position - optional defaults to topright
 * 		@prop {Function} changeHandler - function which will be passed the change event. The context will
 *			be the context of the control.
 * 		@prop {Array of Object} queryOptions - each object in the array represents a NLDI query option.
 * 			Each object should have three properties:
 *	 		@prop {String} id - the string to be used as the featureSource in the NLDI query
 *	 		@prop {String} text - The text to be shown in the selection menu for this featureSource
 *			@prop {String} mapLayer - The layer to be shown on the map when this featureSource is selected.
 *		@prop {String} initialQueryValue - optional. If set, the control's initial value will be set to this
 	*		if it matches one of the queryOptions object's id property.
 */

L.control.QuerySelectControl = L.Control.extend({
	options: {
		position: 'topright',
		changeHandler : null,
		queryOptions : [],
		initialQueryValue : ''
	},
	initialize : function(options) {
		"use strict";

		var isInitialValueInQueryOption = function(queryOption) {
			return options.initialQueryValue === queryOption.id;
		};

		L.setOptions(this, options);
		L.Control.prototype.initialize.apply(this, options);

		this._initialQueryOption = _.find(options.queryOptions, isInitialValueInQueryOption);
		this._queryLayer = undefined;
		this._selectEl = undefined;
	},

	onAdd : function() {
		"use strict";
		var container = L.DomUtil.create('div', 'leaflet-nldi-query-control-div');
		var self = this;

		var addOption = function(optionsString, option) {
			var selected = ((self._initialQueryOption) && (self._initialQueryOption.id === option.id)) ? 'selected' : '';
			return optionsString + '<option value="' + option.id + '" ' + selected + '>' + option.text + '</option>';
		};

		this._selectEl = L.DomUtil.create('select', 'leaflet-nldi-query-picker', container);
		this._selectEl.title = 'Pick a NLDI feature source';
		this._selectEl.innerHTML = this.options.queryOptions.reduce(addOption, '<option value="">Select query source</option>');
		if (this._initialQueryOption) {
			this._queryLayer = this._initialQueryOption.mapLayer;
			this._map.addLayer(this._queryLayer);
		}
		L.DomEvent.addListener(this._selectEl, 'change', this._changeQueryMapLayer, this);
		L.DomEvent.disableClickPropagation(this._selectEl);

		return container;
	},

	onRemove : function(map) {
		"use strict";

		if (this._selectEl) {
			if (this._queryLayer) {
				map.removeLayer(this._queryLayer);
				this._queryLayer = undefined;
			}
			L.DomEvent.removeListener(this._selectEl, 'change', this._changeQueryMapLayer);
			this._selectEl = undefined;
		}
	},

	/*
	 * @returns {String} - the current value of the select query value
	 */
	getValue : function() {
		"use strict";
		var result = '';
		if (this._selectEl) {
			result = this._selectEl.value;
		}
		return result;
	},

	_changeQueryMapLayer : function(ev) {
		"use strict";
		var getLayer = function(queryId, queryOptions) {
			var layer;
			for (var i = 0; i < queryOptions.length; i++) {
				if (queryId === queryOptions[i].id) {
					layer = queryOptions[i].mapLayer;
					break;
				}
			}
			return layer;
		};

		var newQueryLayer = getLayer(ev.currentTarget.value, this.options.queryOptions);

		if (this._queryLayer) {
			this._map.removeLayer(this._queryLayer);
		}
		this._queryLayer = newQueryLayer;
		if (this._queryLayer) {
			this._map.addLayer(this._queryLayer);
		}

		if (this.options.changeHandler) {
			this.options.changeHandler(ev);
		}
	}
});

L.control.querySelectControl = function(options) {
	"use strict";
	return new L.control.QuerySelectControl(options);
};