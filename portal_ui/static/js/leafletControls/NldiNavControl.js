/* jslint browser: true */
/* global L */

L.control.NldiNavControl = L.Control.extend({
	options : {
		position : 'topleft',
		changeHandler : null
	},

	initialize : function(options) {
		"use strict";
		L.setOptions(this, options);
		L.Control.prototype.initialize.apply(this, options);
		this._selectEl = undefined;
	},

	setNavValue : function(value) {
		"use strict";
		if (this._selectEl) {
			this._selectEl.value = value;
		}
	},

	onAdd : function(map) {
		"use strict";

		var container = L.DomUtil.create('div', 'leaflet-nldi-nav-picker-div');
		this._selectEl = L.DomUtil.create('select', 'leaflet-nldi-nav-picker', container);
		this._selectEl.innerHTML = '<option></option>' +
				'<option value="UM">Upstream main</option>' +
				'<option value="DM">Downstream main</option>' +
				'<option value="DD">Downstream with diversions</option>' +
				'<option value="DD">Downstream with diversions</option>';
		L.DomEvent.addListener(this._selectEl, 'change', this.options.changeHandler, this);
		L.DomEvent.disableClickPropagation(this._selectEl);

		return container;
	},

	onRemove : function(map) {
		"use strict";
		L.DomEvent.removeListener(this._selectEl, 'change', this.options.changeHandler);
	}
});

L.control.nldiNavControl = function(options) {
	"use strict";
	return new L.control.NldiNavControl(options);
};
