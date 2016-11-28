// Karma configuration
// Generated on Thu Feb 18 2016 09:06:03 GMT-0600 (CST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'wqp/bower_components/underscore/underscore-min.js',
        'wqp/bower_components/jquery/dist/jquery.min.js',
        'wqp/bower_components/bootstrap/dist/js/bootstrap.min.js',
        'wqp/bower_components/jquery-ui/jquery-ui.min.js',
        'wqp/bower_components/numeral/min/numeral.min.js',
        'wqp/bower_components/select2/dist/js/select2.min.js',
        'wqp/bower_components/handlebars/handlebars.min.js',
        'wqp/bower_components/loglevel/dist/loglevel.min.js',
        'wqp/bower_components/leaflet/dist/leaflet.js',
        'wqp/bower_components/leaflet-providers/leaflet-providers.js',
        'wqp/bower_components/esri-leaflet/dist/esri-leaflet.js',
        'wqp/bower_components/Leaflet.EasyButton/src/easy-button.js',
        'wqp/portal_ui/static/vendor/OpenLayers/OpenLayers.js',
        'test/js/vendor/sinon-1.17.2.js',
        'test/resources/testConfig.js',
        'wqp/portal_ui/static/js/**/*.js',
        'test/js/portal_ui/**/*.js'
    ],


    // list of files to exclude
    exclude: [
        'wqp/portal_ui/static/js/portalOnReady.js',
        'wqp/portal_ui/static/js/angular/**/*.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'wqp/portal_ui/static/js/**/*.js': ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'coverage'],

    coverageReporter: {
      reporters : [
        {type: 'html', dir : 'coverage/'},
        {type: 'cobertura', dir: 'coverage/'},
        {type: 'lcovonly', dir: 'coverage/'}
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
