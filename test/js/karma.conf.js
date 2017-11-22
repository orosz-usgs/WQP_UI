// Karma configuration
// Generated on Thu Feb 18 2016 09:06:03 GMT-0600 (CST)

var sourcePreprocessors = ['coverage'];
function isDebug(argument) {
    return argument === '--debug';
};
if (process.argv.some(isDebug)) {
    sourcePreprocessors = [];
}

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'sinon'],


    // list of files / patterns to load in the browser
    files: [
        'wqp/bower_components/js/underscore-min.js',
        'wqp/bower_components/js/jquery.min.js',
        'wqp/bower_components/js/bootstrap.js',
        'wqp/bower_components/js/jquery-ui.js',
        'wqp/bower_components/js/numeral.js',
        'wqp/bower_components/js/select2.js',
        'wqp/bower_components/js/handlebars.js',
        'wqp/bower_components/js/loglevel.js',
        'wqp/bower_components/js/leaflet.js',
        'wqp/bower_components/js/leaflet-providers.js',
        'wqp/bower_components/js/esri-leaflet.js',
        'wqp/bower_components/js/leaflet.markercluster.js',
        'wqp/bower_components/js/easy-button.js',
        'test/resources/testConfig.js',
        'wqp/portal_ui/static/js/**/*.js',
        {pattern: 'wqp/portal_ui/static/js/hbTemplates/*.hbs', included: false},
        'test/js/portal_ui/**/*.js'
    ],


    // list of files to exclude
    exclude: [
        'wqp/portal_ui/static/js/portalOnReady.js',
        'wqp/portal_ui/static/js/coverage/coverageOnReady.js',
        'wqp/portal_ui/static/js/providerSiteMapOnReady.js',
        'wqp/portal_ui/static/js/providerSitesMapOnReady.js',
        'wqp/portal_ui/static/js/angular/**/*.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'wqp/portal_ui/static/js/**/*.js': sourcePreprocessors
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
