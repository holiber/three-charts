var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var WebpackOnBuildPlugin = require('on-build-webpack');


module.exports = {
    entry: {
        ThreeChart: './index.ts',
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
        // new CommonsPlugin({
        //     name: "threeChart"
        // }),

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
