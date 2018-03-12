/**
 * Created by admin on 2017/8/31.
 */
/**
 * Created by admin on 2017/8/30.
 */
/**
 * Created by admin on 2017/8/17.
 */
var path = require('path');
var fs = require('fs')
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin')






function getDir(str) {

    var dir = fs.readdirSync(str);

    return  dir.filter((item) => {

        var v = path.resolve(__dirname, item);

        if (fs.existsSync(v) && fs.statSync(v).isFile()) {
            return /^app.*/i.test(item)
        } else {
            return (!/(node_modules|dist|.idea)/i.test(item))
        }

        return (!/(node_modules|dist)/i.test(item) && !/^app.*/i.test(item)) || /^app.*/i.test(item)
    }).map((obj) => {

        return {
            from: path.resolve(__dirname, obj),
            to: path.resolve(__dirname, 'dist', obj)
        }
    })

}





module.exports = {
    // context: path.join(__dirname, 'src/es6'),
    entry: {
        myapp:'./src/es6/myapp.js'
    },
    output: {
        path: path.join(__dirname, 'dist/src'),
        filename: '[name].js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                query: {
                    presets: ['es2015','stage-0']
                },
                loader: 'babel-loader',
                exclude: /node_modules/
            },

        ]
    },
    plugins: [


        new CopyWebpackPlugin(getDir(path.resolve(__dirname)),{
                ignore: [
                    'es6/*.js',
                    'pages/**/*.less',
                    'pages/**/*.css',
                    'pages/**/**/*.less',
                    'pages/**/**/*.css',

                ],
                copyUnmodified: true
        }),
    ],
    resolve: {
        extensions: ['.js']
    },
}


