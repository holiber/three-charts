var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    entry: {
        'demoApp': './demoApp.ts',
        'previewApp': './demo/previewApp.ts'
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
                loader: 'ts-loader', //awesome-typescript-loader

            }
        ]
    },

    plugins: [
        new CommonsPlugin({
            name: "chart"
        })
    ]
};
