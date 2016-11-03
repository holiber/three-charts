var webpack = require('webpack');
var helpers = require('./helpers');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var WatchIgnorePlugin = webpack.WatchIgnorePlugin;
var ncp = require('ncp').ncp;


module.exports = {
    entry: {
        ThreeChart: './index.ts',
        demoApp: './demo/demoApp.ts',
        //simpleDemo: './demo/simple/simpleDemo.ts'
    },
    output: {
        path: helpers.root('build'),
        filename: '[name].js',
        library: 'THREE_CHARTS',
        libraryTarget: "umd"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    },

    plugins: [

        new webpack.optimize.UglifyJsPlugin({
            compress: false,
            beautify: true,
            mangle: false
        }),

        new CopyWebpackPlugin([
            { from: 'node_modules/three/build/three.js' },
            { from: 'node_modules/gsap/src/uncompressed/TweenMax.js'},
            { from: 'src/polyfills', to: 'src/polyfills' }
        ]),

		new WatchIgnorePlugin([
			helpers.root('node_modules'),
		]),


        new WebpackOnBuildPlugin(function(stats) {

			// make index file and add commonJS support
            var fs = require('fs');
            fs.writeFileSync(helpers.root('build') + '/index.js', 'module.exports = require("./ThreeChart")');

			// copy built project to node_modules to allow
			// plugins to use just built version of three-charts
			ncp(helpers.root('build'), helpers.root('node_modules/three-charts/build'));

        })

    ]
};
