// This is CommonJS rather than ES6 due to bootstrap's dependency on jQuery.
// Using require() avoid ES6 import hoisting.
window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('loglevel');
