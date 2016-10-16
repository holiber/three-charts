var webpack = require('webpack');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var fs = require('fs');
var rimraf = require('rimraf');

var path = require('path');
var _root = path.resolve(__dirname, '.');
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [_root].concat(args));
}

var sourcePath = root('./src/');

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
        console.log('entry:', entry);
        return entry;

    }(),
    output: {
        path: root('build'),
        filename: 'plugins/src/[name]/[name].js',
        library: 'THREE_CHARTS',
        libraryTarget: "umd"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        root: root('./src'),
        modulesDirectories: ['../node_modules'],
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

        new WebpackOnBuildPlugin(function(stats) {

            // fix directories paths
            fs.renameSync(root('build/plugins/src'), root('build-tmp'));
            rimraf.sync(root('build'));
            fs.renameSync(root('build-tmp'), root('build'));

            // make index.js files for each plugin
            getPluginsNames().forEach(pluginName => {
                fs.writeFileSync(root('build/' + pluginName + '/index.js'), 'module.exports = require("./' + pluginName + '")');
            });

        })

    ]
};
