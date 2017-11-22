var copy = require('cpy');

copy(
	[
		'node_modules/bootstrap/dist/js/bootstrap.js',
		'node_modules/jquery/dist/*.*',
		'node_modules/select2/dist/js/*.js',
		'node_modules/jquery-ui-dist/*.js',
		'node_modules/numeral/src/*.js',
		'node_modules/numeral/src/min/numeral.min.js',
		'node_modules/underscore/*.js',
		'node_modules/handlebars/dist/*.js',
		'node_modules/loglevel/dist/*.js',
		'node_modules/leaflet/dist/*.js',
		'node_modules/leaflet-providers/*.js',
		'node_modules/leaflet-easybutton/src/*.js',
		'node_modules/esri-leaflet/dist/*.js',
		'node_modules/leaflet.markercluster/dist/*.js',
		'node_modules/leaflet-draw/dist/*.js'
	], 'wqp/bower_components/js');

copy([
	'node_modules/select2/dist/css/*.css',
	'node_modules/jquery-ui-dist/*.css',
	'node_modules/select2-bootstrap-theme/dist/*.css',
	'node_modules/leaflet-easybutton/src/*.css',
	'node_modules/leaflet.markercluster/dist/*.css'
	], 'wqp/bower_components/css');

copy([
	'node_modules/leaflet/dist/*.css'
], 'wqp/bower_components/css/leaflet');
copy([
	'node_modules/leaflet/dist/images/*'
], 'wqp/bower_components/css/leaflet/images');

copy([
	'node_modules/leaflet-draw/dist/*.css'
], 'wqp/bower_components/css/leaflet-draw');
copy([
	'node_modules/leaflet-draw/dist/images/*'
], 'wqp/bower_components/css/leaflet-draw/images')

copy([
	'node_modules/jquery-ui-dist/images/*'
	], 'wqp/bower_components/css/images');

copy([
	'node_modules/bootstrap/less/*.less',
	], 'wqp/bower_components/less/bootstrap');
copy([
	'node_modules/font-awesome/less/*.less'
	], 'wqp/bower_components/less/font-awesome');

copy([
	'node_modules/font-awesome/fonts/*',
], 'wqp/bower_components/fonts/font-awesome');

copy(['node_modules/bootstrap/less/mixins/*.less'], 'wqp/bower_components/less/bootstrap/mixins');
