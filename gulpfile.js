    var gulp = require('gulp')
    var minifycss = require('gulp-minify-css')
    var less = require('gulp-less')
    var path = require('path')
    var fs = require('fs')
    var notify = require('gulp-notify');
    var merge = require('merge-stream')
    var plumber = require('gulp-plumber')

    function getFile(){
        var filePath = fs.readdirSync(path.resolve('./src/pages'))
        var fileArr = []
        filePath.forEach(function(item){
            var pagePath = path.join('./src/pages',item)
            var pageFiles = fs.readdirSync(pagePath)

            pageFiles.forEach(function(v) {
                var lastPath = path.join(pagePath,v,v + '.less')

                fileArr.push(lastPath.split('\\').join('/'))
            })
        })

        return fileArr
    }


    var files = getFile();
    gulp.task('less', function () {

        var tasks = files.map(function(item){
            return gulp.src('./'+ item)

                .pipe(less())
                .pipe(gulp.dest('./'+ path.join(item,'..')))
                .pipe(minifycss())
                .pipe(gulp.dest('./'+ path.join(item,'..')))
                .pipe(notify({message:'ok'}))
        })


        return merge(...tasks)

    })





    gulp.task('default',['less']);

