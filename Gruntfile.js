module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			default: ['js/packages', 'js/ts', 'log/*', 'tmp/*']
		},
		copy: {
			js: {
				files: [
					{
						expand: true,
						cwd: 'node_modules/ace-builds/src-min/',
						src: ['ace.js', 'theme-dawn.js', 'mode-xquery.js', 'worker-xquery.js'],
						dest: 'js/packages/ace'
					},
					{
						expand: true,
						cwd: 'node_modules/requirejs',
						src: 'require.js',
						dest: 'js/packages/'
					},
					{
						expand: true,
						cwd: 'node_modules/rxjs/bundles/',
						src: '*',
						dest: 'js/packages/'
					},
					{
						expand: true,
						cwd: 'node_modules/pivottable/dist/',
						src: '*',
						dest: 'js/packages/pivottable/'
					}
				]
			}
		},
		jison: {
			default: {
				options: { moduleType: 'amd' },
				files: { 'js/ts/parser/xpath.js': ['ts/parser/xpath.jison', 'ts/parser/xpath.jisonlex'] }
			}
		},
		ts: {
			default: {
				src: ['!node_modules/**', 'ts/**/*.ts'],
				outDir: 'js/ts',
				options: {
					keepDirectoryHierarchy: true,
					module: 'amd',
					moduleResolution: 'node',
					fast: 'never',
					target: 'ES5',
					inlineSourceMap: true,
					noFallthroughCasesInSwitch: true,
					// noImplicitAny: true, // not compatible with JQuery
					noImplicitUseStrict: true,
					noImplicitReturns: true,
					// strictNullChecks: true // not compatible with JQuery
				}
			}
		},
		uglify: {
			build: {
				files: {
					'js/min/api.min.js': ['js/api-facets.js', 'js/api-scripts.js'],
					'js/min/results.min.js': ['js/results.js'],
					'js/min/scripts.min.js': ['js/scripts.js'],
					'js/min/tree-visualizer.min.js': ['js/tree-visualizer.js'],
				}
			}
		},
		sass: {
			build: {
				files: {
					'style/css/ie.css': 'style/scss/ie.scss',
					'style/css/styles.css': 'style/scss/styles.scss',
					'style/css/tree-visualizer.css': 'style/scss/tree-visualizer.scss',
				}
			}
		},
		cssmin: {
			build: {
				files: {
					'style/css/min/ie.min.css': ['style/css/ie.css'],
					'style/css/min/styles.min.css': ['style/css/styles.css'],
					'style/css/min/tree-visualizer.min.css': ['style/css/tree-visualizer.css'],
				}
			}
		},

		// use karma to run tests
		karma: {
			options: {
				configFile: 'karma.conf.js'
			},
			default: {
				logLevel: 'INFO',
			}
		},

		watch: {
			ts: {
				files: ['ts/**/*.ts'],
				tasks: ['ts', 'karma']
			},
			js: {
				files: ['js/*.js'],
				tasks: ['uglify']
			},
			css: {
				files: ['style/scss/*.scss'],
				tasks: ['sass', 'cssmin']
			}
		},
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-jison');

	// Default task(s).
	grunt.registerTask('default', ['clean', 'copy', 'jison', 'ts', 'uglify', 'sass', 'cssmin', 'karma']);
};
