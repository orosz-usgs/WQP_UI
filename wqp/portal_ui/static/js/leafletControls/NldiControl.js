/* jslint browser: true */
/* global L */

L.control.NldiControl = L.Control.extend({
	options : {
		position : 'topleft',
		navOptions : [],
		navChangeHandler : null,
		distanceChangeHandler : null,
		clearClickHandler : null
	},

	initialize : function(options) {
		"use strict";
		L.setOptions(this, options);
		L.Control.prototype.initialize.apply(this, options);
		this._navSelectEl = undefined;
		this._distanceInput = undefined;
		this._clearBtn = undefined;
	},

	setNavValue : function(value) {
		"use strict";
		if (this._navSelectEl) {
			this._navSelectEl.value = value;
		}
	},

	setDistanceValue : function(value) {
		"use strict";
		if (this._distanceInput) {
			this._distanceInput.value = value;
		}
	},

	onAdd : function() {
		"use strict";

		var container = L.DomUtil.create('div', 'leaflet-nldi-input-div');
		var addOption = function(optionsString, option) {
			return optionsString + '<option value="' + option.id + '">' + option.text + '</option>';
		};

		this._navSelectEl = L.DomUtil.create('select', 'leaflet-nldi-nav-picker', container);
		this._navSelectEl.title = 'Pick navigation type';
		this._navSelectEl.innerHTML = this.options.navOptions.reduce(addOption, '<option value="">Select navigation type</option>');
		L.DomEvent.addListener(this._navSelectEl, 'change', this.options.navChangeHandler, this);
		L.DomEvent.disableClickPropagation(this._navSelectEl);

		this._distanceInput = L.DomUtil.create('input', 'leaflet-nldi-distance-input', container);
		this._distanceInput.type = 'text';
		this._distanceInput.size = '15';
		this._distanceInput.title = 'Optional distance from comid';
		this._distanceInput.placeholder = 'Distance in km';
		L.DomEvent.addListener(this._distanceInput, 'change', this.options.distanceChangeHandler, this);
		L.DomEvent.disableClickPropagation(this._distanceInput);

		this._clearBtn = L.DomUtil.create('button', 'leaflet-nldi-clear-btn', container);
		this._clearBtn.type = 'button';
		this._clearBtn.title = 'Reset map';
		this._clearBtn.innerHTML = '<i class="fa fa-undo"></i>';
		L.DomEvent.addListener(this._clearBtn, 'click', this.options.clearClickHandler, this);
		L.DomEvent.disableClickPropagation(this._clearBtn);

		return container;
	},

	onRemove : function() {
		"use strict";
		L.DomEvent.removeListener(this._navSelectEl, 'change', this.options.navChangeHandler);
		L.DomEvent.removeListener(this._distanceInput, 'change', this.options.distanceChangeHandler);
		L.DomEvent.removeListener(this._clearBtn, 'click', this.options.clearClickHandler);
	}
});

L.control.nldiControl = function(options) {
	"use strict";
	return new L.control.NldiControl(options);
};
