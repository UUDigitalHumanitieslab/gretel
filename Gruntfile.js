var webpackConfig = require('./webpack.config');
module.exports = function (grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			default: ['ts/parser/xpath.js', 'js/packages', 'js/ts', 'log/*', 'tmp/*']
		},
		copy: {
			js: {
				files: [
					{
						expand: true,
						cwd: 'node_modules/pivottable/dist/',
						src: '*.css',
						dest: 'js/packages/pivottable/'
					}
				]
			}
		},
		jison: {
			default: {
				options: { moduleType: 'commonjs' },
				files: { 'ts/parser/xpath.js': ['ts/parser/xpath.jison', 'ts/parser/xpath.jisonlex'] }
			}
		},
		webpack: {
			main: webpackConfig
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
				options: {
					loadPath: ['./node_modules']
				},
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
			jison: {
				files: ['ts/**/*.jison', 'ts/**/*.jisonlex'],
				tasks: ['jison', 'webpack', 'karma']
			},
			ts: {
				files: ['ts/**/*.ts'],
				tasks: ['webpack', 'karma']
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
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-jison');

	// Default task(s).
	grunt.registerTask('default', ['clean', 'copy', 'jison', 'webpack', 'uglify', 'sass', 'cssmin', 'karma']);
};
