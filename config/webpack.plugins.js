var fs = require('fs');
var rimraf = require('rimraf');
var webpack = require('webpack');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;

var helpers = require('./helpers');
var pluginsPath = helpers.root('plugins/');
var sourcePath = pluginsPath + 'src/';


/**
 * collect all plugins names from folders
 */
function getPluginsNames() {
    var pluginsDirs = fs.readdirSync(sourcePath);
    var pluginsList = pluginsDirs.filter(fileName => fs.statSync(sourcePath + fileName).isDirectory());
    return pluginsList;
}

module.exports = {
    entry: function () {
        var pluginsList = getPluginsNames();
        var entry = {};
        pluginsList.forEach((pluginName) => entry[pluginName] = sourcePath + pluginName + '/index.ts');
        return entry;

    }(),
    output: {
        path: pluginsPath + '/build',
        filename: 'plugins/src/[name]/[name].js',
        library: ['THREE_CHARTS', '[name]'],
        libraryTarget: "umd"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    externals: {
      'three-charts': 'three-charts'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                exclude: [helpers.root('node_modules')],
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

        new TsConfigPathsPlugin(/* { tsconfig, compiler } */),

        new WebpackOnBuildPlugin(function(stats) {

            // fix directories paths
            fs.renameSync(pluginsPath + '/build/plugins/src', pluginsPath + '/build-tmp');
            rimraf.sync(pluginsPath + '/build');
            fs.renameSync(pluginsPath + '/build-tmp', pluginsPath + '/build');

            // make index.js files for each plugin
            getPluginsNames().forEach(pluginName => {
                fs.writeFileSync(pluginsPath + '/build/' + pluginName + '/index.js', 'module.exports = require("./' + pluginName + '")');
            });

        })

    ]
};
