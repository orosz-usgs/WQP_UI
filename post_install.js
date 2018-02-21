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
		'node_modules/leaflet-draw/dist/*.js',
		'node_modules/nanobar/*.js'
	], 'wqp/static/vendor/js');

copy([
	'node_modules/select2/dist/css/*.css',
	'node_modules/jquery-ui-dist/*.css',
	'node_modules/select2-bootstrap-theme/dist/*.css',
	'node_modules/leaflet-easybutton/src/*.css',
	'node_modules/leaflet.markercluster/dist/*.css'
	], 'wqp/static/vendor/css');

copy([
	'node_modules/leaflet/dist/*.css'
	], 'wqp/static/vendor/css/leaflet');
copy([
	'node_modules/leaflet/dist/images/*'
	], 'wqp/static/vendor/css/leaflet/images');

copy([
	'node_modules/leaflet-draw/dist/*.css'
	], 'wqp/static/vendor/css/leaflet-draw');
copy([
	'node_modules/leaflet-draw/dist/images/*'
	], 'wqp/static/vendor/css/leaflet-draw/images')

copy([
	'node_modules/jquery-ui-dist/images/*'
	], 'wqp/static/vendor/css/images');

copy([
	'node_modules/bootstrap/less/*.less',
	], 'wqp/static/vendor/less/bootstrap');
copy([
	'node_modules/font-awesome/less/*.less'
	], 'wqp/static/vendor/less/font-awesome');

copy([
	'node_modules/font-awesome/fonts/*',
	], 'wqp/static/vendor/fonts/font-awesome');

copy([
	'node_modules/bootstrap/less/mixins/*.less'
	], 'wqp/static/vendor/less/bootstrap/mixins');
