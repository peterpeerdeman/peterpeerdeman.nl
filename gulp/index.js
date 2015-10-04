var gulp = require('gulp');
var deploy = require('gulp-gh-pages');
var sass = require('gulp-sass');
var connect = require('gulp-connect');

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        livereload: true
    });
});

gulp.task('watch', function() {
    gulp.watch([
        './src/*.html',
        './src/sass/*.sass'
    ], [
        'statics',
        'styles'
    ]);
});

gulp.task('statics', function() {
    gulp.src([
        'src/*.*',
        'src/img/**',
        'src/fonts/**',
    ], {base:'src'})
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload())
});

gulp.task('styles', function() {
    return gulp.src('./src/sass/index.sass')
        .pipe(sass({
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', sass.logError))
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload());
});

gulp.task('deploy', function() {
    return gulp.src('./dist/**/*')
        .pipe(deploy())
});

gulp.task('default', ['statics', 'styles', 'connect', 'watch']);
