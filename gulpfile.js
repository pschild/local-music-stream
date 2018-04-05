const gulp = require('gulp');
const zip = require('gulp-zip');
const tap = require('gulp-tap');

gulp.task('build-alexa', () =>
    gulp.src(['alexa/**', '.env'], { dot: true, nodir: true })
        // see https://github.com/sindresorhus/gulp-zip/issues/64
        /*.pipe(tap(function(file) {
            if (file.isDirectory()) {
                file.stat.mode = parseInt('40777', 8);
            }
        }))
        .pipe(zip('alexa.zip'))*/
        .pipe(gulp.dest('dist'))
);