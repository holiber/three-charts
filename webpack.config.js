var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');


module.exports = {
    entry: {
        ThreeChart: './index.ts',
        demoApp: './demo/demoApp.ts',
        simpleDemo: './demo/simple/simpleDemo.ts'
    },
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
        library: '[name]'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                exclude: [__dirname + '/src/node_modules'],
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
            { from: 'src/polyfills', to: 'src/polyfills' }
        ]),

        // new UnminifiedWebpackPlugin(),
        
        // make index file and add commonJS support
        new WebpackOnBuildPlugin(function(stats) {
            var fs = require('fs');
            var commonJsSupportScript = '\n if (typeof module !== "undefined" && module.exports) module.exports = ThreeChart;';
            fs.appendFileSync(__dirname + '/build/ThreeChart.js', commonJsSupportScript);
            fs.appendFileSync(__dirname + '/build/ThreeChart.min.js', commonJsSupportScript);
            fs.writeFileSync(__dirname + '/build/index.js', 'module.exports = require("./ThreeChart")');
        })

    ]
};
