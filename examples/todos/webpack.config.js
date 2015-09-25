/* global __dirname */
"use strict";

module.exports = {
	entry: __dirname + '/js/app.js',

	output: {
		path: __dirname + '/dist',
		filename: 'bundle.js',
		sourceMapFilename: 'bundle.map'
	},

	module: {
		loaders: [{
					test: /\.js$/,
					exclude: /(node_modules|bower_components)/,
					loaders: ['babel-loader?experimental&optional=selfContained']
				}
		]
	}
}