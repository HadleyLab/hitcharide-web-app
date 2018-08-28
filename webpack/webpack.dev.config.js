const path = require('path');
const utils = require('./webpack.utils');

const config = {
    url: 'localhost',
    port: 3000,
};

const publicPath = `http://${config.url}:${config.port}/`;

module.exports = {
    entry: [
        `webpack-dev-server/client?${publicPath}`,
        'babel-polyfill',
        './src/app.js',
    ],
    output: {
        publicPath,
        path: path.resolve(__dirname, 'build'),
        filename: 'app.js',
    },
    devServer: {
        publicPath,
        contentBase: false,
        stats: 'minimal',
        host: '0.0.0.0',
        port: config.port,
    },
    resolve: utils.resolve,
    module: utils.module('development'),
    plugins: utils.plugins('development'),
};
