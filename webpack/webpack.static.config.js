const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const utils = require('./webpack.utils');

module.exports = {
    entry: ['babel-polyfill', './src/app.js'],
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'app.[hash].js',
        publicPath: '/',
    },
    resolve: utils.resolve,
    module: utils.module('production'),
    plugins: utils.plugins('production'),
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
            }),
        ],
    },
};
