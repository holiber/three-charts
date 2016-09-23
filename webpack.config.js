var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
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

        new CopyWebpackPlugin([
            { from: 'node_modules/three/three.js' },
            { from: 'src/polyfills', to: 'src/polyfills' }
        ]),
        
        // make webgl-chart.js index file
        new WebpackOnBuildPlugin(function(stats) {
            var fs = require('fs');
            var sourceFile = __dirname + '/build/ThreeChart.js';
            var scriptContent = fs.readFileSync(sourceFile);
            scriptContent += '\n if (typeof module !== "undefined" && module.exports) module.exports = ThreeChart;';
            fs.writeFileSync(sourceFile, scriptContent);
            fs.writeFileSync(__dirname + '/build/index.js', scriptContent);
        })

    ]
};
