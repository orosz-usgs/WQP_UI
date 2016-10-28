grunt.initConfig({
	coveralls: {
		options: {
			force: false
		},
		karmatests: {
			src: 'js_test_results.info'
		}
	}
});

grunt.loadNpmTasks('grunt-coveralls');
