var CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");
var WebpackOnBuildPlugin = require('on-build-webpack');


module.exports = {
    entry: {
        ThreeChart: './index.ts',
        demoApp: "./demo/demoApp.ts"
        //vendor: ["EventEmitter2"]
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
                exclude: [__dirname + '/src/node_modules'],
                test: /\.ts$/,
                loader: 'awesome-typescript-loader', //'ts-loader'
                //include: [__dirname + '/src/**/*', __dirname + '/demo/**/*']
            }
        ]
    },

    plugins: [
        //new CommonsPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),

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
