var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('serve', function() {

    browserSync.init({
        server: "./public",
        port: 8080
    });

});

gulp.task('default',['serve']);