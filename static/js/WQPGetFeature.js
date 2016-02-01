WQPGetFeature = OpenLayers.Class(OpenLayers.Control.GetFeature, {
	/* Extend the GetFeature control to save the bounding box used the last time a WFS request was made. */

	CLASS_NAME: 'WQPGetFeature',


	/* private options */
	selectBoundingBox: new OpenLayers.Bounds(), /* Contains the bounding box of the last WFS GetFeature request */
	selectBoxFeatures: [], /* Vector feature for non point select boxes.

	 /* public functions */
	getLastBoundingBox: function () {
		return this.selectBoundingBox;
	},
	getSelectBoxFeatures: function () {
		return this.selectBoxFeatures;
	},

	/* Prototype extensions */
	initialize: function (options) {
		OpenLayers.Control.GetFeature.prototype.initialize.apply(this, [options]);
	},
	selectBox: function (position) {
		if (position instanceof OpenLayers.Bounds) {
			var upperLeftLonLat = this.map.getLonLatFromPixel(new OpenLayers.Pixel(position.left, position.top));
			var lowerRightLonLat = this.map.getLonLatFromPixel(new OpenLayers.Pixel(position.right, position.bottom));
			this.selectBoundingBox = new OpenLayers.Bounds(upperLeftLonLat.lon, lowerRightLonLat.lat, lowerRightLonLat.lon, upperLeftLonLat.lat);
			this.selectBoxFeatures = [new OpenLayers.Feature.Vector(this.selectBoundingBox.toGeometry())];
		}
		else if (!this.click) {
			this.selectBoundingBox = this.pixelToBounds(position);
			this.selectBoxFeatures = [];
		}

		OpenLayers.Control.GetFeature.prototype.selectBox.apply(this, [position]);
	},

	selectClick: function (evt) {
		this.selectBoundingBox = this.pixelToBounds(evt.xy);
		this.selectBoxFeatures = [];

		OpenLayers.Control.GetFeature.prototype.selectClick.apply(this, [evt]);
	}
});


