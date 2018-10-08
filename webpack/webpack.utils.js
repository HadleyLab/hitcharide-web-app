const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const postcssNested = require('postcss-nested');
const postcssSassColorFunctions = require('postcss-sass-color-functions');
const csso = require('postcss-csso');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');

const devCss = {
    test: /\.css$/,
    use: [
        { loader: 'style-loader' },
        {
            loader: 'css-loader',
            options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]--[local]--[hash:base64:3]',
                minimize: false,
                sourceMap: true,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                plugins: () => [
                    autoprefixer,
                    postcssNested,
                    postcssSassColorFunctions,
                    csso,
                ],
                sourceMap: true,
            },
        },
    ],
};

const prodCss = {
    test: /\.css$/,
    use: [
        {
            loader: MiniCssExtractPlugin.loader,
        },
        {
            loader: 'css-loader',
            options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]--[local]--[hash:base64:3]',
                minimize: true,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                plugins: () => [
                    autoprefixer,
                    postcssNested,
                    postcssSassColorFunctions,
                    csso,
                ],
            },
        },
    ],
};

function css(mode) {
    if (mode === 'development') {
        return devCss;
    }

    return prodCss;
}

function modules(mode) {
    return {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader' },
                ],
            },
            css(mode),
            {
                test: /\.less/,
                use: [
                    'style-loader',
                    'css-loader',
                    { loader: 'less-loader', options: { javascriptEnabled: true } },
                ],
            },
            {
                test: /robots.txt/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'robots.txt',
                        },
                    },
                ],
            },
            {
                test: /\.(png|svg|gif|jpg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                        },
                    },
                ],
            },
            // {
            //     test: /\.(png|svg|gif)$/,
            //     use: [
            //         {
            //             loader: 'url-loader',
            //             options: {
            //                 limit: 5000,
            //                 name: 'images/[name].[ext]',
            //             },
            //         },
            //     ],
            // },
            {
                test: /\.(woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 50000,
                            name: 'fonts/[name].[ext]',
                        },
                    },
                ],
            },
        ],
    };
}

function plugins(mode) {
    const pluginsList = [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            filename: './index.html',
        }),
    ];

    if (mode === 'development') {
        pluginsList.push(new webpack.HotModuleReplacementPlugin());
    }

    if (mode === 'production') {
        pluginsList.push(new MiniCssExtractPlugin({
            filename: 'styles.[hash].css',
        }));
        pluginsList.push(new PrerenderSPAPlugin({
            staticDir: path.resolve(__dirname, '../build'),
            routes: ['/'],
        }));
    }
    pluginsList.push(new webpack.DefinePlugin({
        BACKEND_URL: `"${process.env.BACKEND_URL}"`,
    }));

    return pluginsList;
}

const resolve = {
    modules: ['node_modules'],
    alias: {
        components: path.resolve('../src/components/'),
        pages: path.resolve('../src/pages/'),
        libs: path.resolve('../src/libs'),
        services: path.resolve('../src/services'),
        src: path.resolve('../src/'),
    },
    extensions: ['*', '.json', '.js'],
};

module.exports = {
    module: modules,
    plugins,
    resolve,
};
