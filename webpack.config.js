var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var WebpackOnBuildPlugin = require('on-build-webpack');


module.exports = {
    entry: {
        // 'demoApp': './demoApp.ts',
        index: './index.ts',
        demoApp: "./demo/demoApp.ts"
    },
    output: {
        path: __dirname + '/build',
        filename: '[name].js',
        library: '[name]'
        //filename: 'build/webpackbundle.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader' //'ts-loader'

            }
        ]
    },

    plugins: [
        new CommonsPlugin({
            name: "webgl-chart"
        }),

        // make webgl-chart.js index file
        new WebpackOnBuildPlugin(function(stats) {
            var fs = require('fs');
            fs.createReadStream(__dirname + '/build/webgl-chart.js')
                .pipe(fs.createWriteStream(__dirname + '/build/index.js'));
        })

    ]
};
