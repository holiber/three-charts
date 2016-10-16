var webpack = require('webpack');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var fs = require('fs');

var path = require('path');
var _root = path.resolve(__dirname, '..');
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}


module.exports = {
    entry: function () {
        // collect all plugins
        var sourcePath = root('./plugins/src/');
        console.log(sourcePath);
        var pluginsDirs = fs.readdirSync(sourcePath);
        var pluginsList = pluginsDirs.filter(fileName => fs.statSync(sourcePath + fileName).isDirectory());
        var entry = {};
        pluginsList.forEach((pluginName) => entry[pluginName] = sourcePath + pluginName + '/index.ts');
        console.log('entry:', entry);
        return entry;

    }(),
    output: {
        path: root('plugins/build'),
        filename: 'plugins/src/[name]/[name].js',
        library: '[name]',
        libraryTarget: "umd"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        root: root('./src'),
        modulesDirectories: ['../node_modules', './deps'],
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
    externals: {
        '../ThreeChart': 'ThreeChartLib'
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
            // fs.writeFileSync(helpers.root('build') + '/index.js', 'module.exports = require("./ThreeChart")');
        })

    ]
};
