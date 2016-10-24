var webpack = require('webpack');
var helpers = require('./helpers');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');


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

        
        // make index file and add commonJS support
        new WebpackOnBuildPlugin(function(stats) {
            var fs = require('fs');
            fs.writeFileSync(helpers.root('build') + '/index.js', 'module.exports = require("./ThreeChart")');

        })

    ]
};
