const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const utils = require('./webpack.utils');

module.exports = {
    entry: ['babel-polyfill', './src/app.js'],
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'app.[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
        publicPath: '/',
    },
    resolve: utils.resolve,
    module: utils.module('production'),
    plugins: utils.plugins('production'),
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    maxSize: 600000,
                    reuseExistingChunk: true,
                },
            },
        },
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
            }),
        ],
    },
};
