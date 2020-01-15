/**
 * Rollup configuration.
 * NOTE: This is a CommonJS module so it can be imported by Karma.
 */

const buble = require('@rollup/plugin-buble');
const commonjs = require('@rollup/plugin-commonjs');
var handlebars = require('rollup-plugin-handlebars-plus');
const json = require('@rollup/plugin-json');
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const { uglify } = require('rollup-plugin-uglify');


const ENV = process.env.NODE_ENV || 'development';

const getBundleConfig = function (src, dest) {
    return {
        input: src,
        plugins: [
            resolve({
                mainFields: ['module']
            }),
            json(),
            commonjs(),
            handlebars({
                handlebars: {
                    options: {
                        sourceMap: ENV !== 'production' ? 'inline' : false
                    }
                },
                templateExtension: '.hbs'
            }),
            buble({
                objectAssign: 'Object.assign',
                transforms: {
                    dangerousForOf: true
                }
            }),
            replace({
              'process.env.NODE_ENV': JSON.stringify(ENV)
            }),
            ENV === 'production' && uglify({
                compress: {
                    dead_code: true,
                    drop_console: true
                }
            })
        ],
        output: {
            name: 'wqp_bundle',
            file: dest,
            format: 'iife',
            sourcemap: ENV !== 'production' ? 'inline' : false
        },
        treeshake: ENV === 'production'
    };
};

module.exports = [
    getBundleConfig('js/bundles/portal.js', 'dist/scripts/portal.js'),
    getBundleConfig('js/bundles/coverage.js', 'dist/scripts/coverage.js'),
    getBundleConfig('js/bundles/site_map.js', 'dist/scripts/site_map.js'),
    getBundleConfig('js/bundles/sites_map.js', 'dist/scripts/sites_map.js')
];
