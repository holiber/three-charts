var webpack = require('webpack');
var helpers = require('./helpers');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");


module.exports = {
    entry: {
        ThreeChart: './index.ts',
        demoApp: './demo/demoApp.ts',
        //simpleDemo: './demo/simple/simpleDemo.ts'
    },
    output: {
        path: helpers.root('build'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: "umd"
    },
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                exclude: [helpers.root('/src/node_modules')],
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

        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // }),

        new CopyWebpackPlugin([
            { from: 'node_modules/three/three.js' },
            { from: 'node_modules/gsap/src/uncompressed/TweenMax.js'},
            { from: 'src/polyfills', to: 'src/polyfills' }
        ]),

        // new CommonsPlugin({
        //     name: "common"
        // }),

        // new UnminifiedWebpackPlugin(),
        
        // make index file and add commonJS support
        new WebpackOnBuildPlugin(function(stats) {
            var fs = require('fs');
            // var commonJsSupportScript = '\n if (typeof module !== "undefined" && module.exports) module.exports = ThreeChart;';
            // fs.appendFileSync(__dirname + '/build/ThreeChart.js', commonJsSupportScript);
            // fs.appendFileSync(__dirname + '/build/ThreeChart.min.js', commonJsSupportScript);
            fs.writeFileSync(helpers.root('build') + '/index.js', 'module.exports = require("./ThreeChart")');
        })

    ]
};
