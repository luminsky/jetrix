const path = require('path');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const absolutePath = path.resolve.bind(path, __dirname);

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all',
        },
    };

    if (isProd) {
        config.minimizer = [new OptimizeCssAssetsWebpackPlugin(), new TerserWebpackPlugin()];
    }

    return config;
};

const filename = ext => (isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`);

module.exports = {
    context: absolutePath('src'),
    mode: 'production',
    entry: {
        main: './main.ts',
    },
    output: {
        filename: filename('js'),
        path: absolutePath('dist'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@img': absolutePath('src/assets/img'),
            '@audio': absolutePath('src/assets/audio'),
        },
    },
    optimization: optimization(),
    devServer: {
        contentBase: 'dist',
        compress: true,
        port: 4200,
    },
    devtool: isDev ? 'source-map' : '',
    plugins: [
        new CleanWebpackPlugin(),
        new HTMLWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
            },
        }),
        new MiniCssExtractPlugin({
            filename: filename('css'),
            allChunks: true,
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: absolutePath('src/favicon.ico'),
                    to: absolutePath('dist'),
                },
                {
                    from: absolutePath('src/assets/img'),
                    to: absolutePath('dist/assets/img'),
                },
                {
                    from: absolutePath('src/assets/audio'),
                    to: absolutePath('dist/assets/audio'),
                },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // 'style-loader'
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                        },
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                        },
                    },
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.ts$/,
                exclude: [absolutePath('node_modules')],
                use: ['ts-loader'],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader'],
            },
            // {
            //   test: /\.(wav|mp3)$/,
            //   loader: 'file-loader?name=/assets/audio/[name].[ext]',
            // },
            {
                test: /\.(ttf|woff|woff2|eot|otf)$/,
                use: ['file-loader'],
            },
        ],
    },
};
