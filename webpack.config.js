var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

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
            name: "chart"
        }),

        // new CopyWebpackPlugin([{ from: 'typings', to: 'typings' }])
    ]
};
