module.exports = function (config) {
    config.set({
        frameworks: ['jasmine', 'requirejs'],

        files: [
            // The tests should be included manually (using AMD)
            { pattern: 'js/!(packages)/**/*.js', included: false },

            'test-main.js'
        ],
        reporters: ['progress'],
        browsers: ['PhantomJS'],
        autoWatch: false,
        singleRun: true
    });
}
