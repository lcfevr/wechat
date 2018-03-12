/**
 * Created by admin on 2017/8/30.
 */
/**
 * Created by admin on 2017/8/17.
 */

var webpack = require('webpack');
var baseWebpackConfig = require('./webpack.base.config.js');
var merge = require('webpack-merge');
var utils = require('./utils')








module.exports = merge(baseWebpackConfig,{
    entry:utils.getEntry(),
    plugins: [

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify("development")
        }),
    ],
})


