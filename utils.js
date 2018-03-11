
var baseWebpackConfig = require('./webpack.base.config.js');
var glob = require('glob')

module.exports = {
    getEntry:function(){
        var files = glob.sync('./src/pages/**/**/*.js');
        var entrys = {}


        files.forEach(function(file){
            var fileName = /.*\/(pages\/.*?\/*)\.js/.exec(file)[1]

            entrys[fileName] = file
        })


        return Object.assign({},baseWebpackConfig.entry, entrys)
    }
}