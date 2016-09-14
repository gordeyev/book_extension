var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var gulpBrowserify = require('gulp-browserify');
var del = require('del');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var stylish = require('jshint-stylish');
var buffer = require('vinyl-buffer');
var _ = require('lodash');
var openurl = require('openurl');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// var api = require('./api/api');

gulp.task('clean', function(cb) {
    return del([
        'app/tmp'
    ], cb);
});

gulp.task('refresh', function(cb) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            openurl.open('http://reload.extensions/');
            resolve('result');
        }, 1);
    });
});

gulp.task('html', function() {
    return gulp.src('./src/*.html')
        .pipe($.plumber())
        .pipe(gulp.dest('./extension'));
});

gulp.task('html-refresh', ['html'], function() {
    gulp.start('refresh');
});

gulp.task('additional', function() {
    return gulp.src('./src/additional/*.js')
        .pipe(gulpBrowserify({
            insertGlobals : true,
            debug : true
        }))
        .pipe(gulp.dest('./extension/js'));
});

gulp.task('additional-refresh', ['additional'], function() {
    gulp.start('refresh');
});

gulp.task('styles', function() {
    return gulp.src('./src/main.less')
        .pipe($.less())
        .pipe($.autoprefixer())
        .pipe($.rename('bundle.css'))
        .pipe(gulp.dest('./extension/css'))
        .pipe(reload({ stream: true }));
});

gulp.task('styles-refresh', ['styles'], function() {
    gulp.start('refresh');
});

var bundler = _.memoize(function(watch) {
    var options = {debug: true};

    if (watch) {
        _.extend(options, watchify.args);
    }

    var b = browserify('./src/main.js', options);

    if (watch) {
        b = watchify(b);
    }

    return b;
});

var handleErrors = function() {
    var args = Array.prototype.slice.call(arguments);
    delete args[0].stream;
    $.util.log.apply(null, args);
    this.emit('end');
};

function bundle(cb, watch) {
    return bundler(watch).bundle()
        .on('error', handleErrors)
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe($.sourcemaps.init({ loadMaps: true }))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('./extension/js'))
        .on('end', cb)
        .pipe(reload({ stream: true }));
}

gulp.task('scripts', function(cb) {
    bundle(cb, true);
});

gulp.task('scripts-refresh', ['scripts'], function() {
    gulp.start('refresh');
});

gulp.task('jshint', function() {
    return gulp.src(['./src/**/*.js', './test/**/*.js'])
        .pipe($.plumber())
        .pipe($.jshint())
        .pipe($.jshint.reporter(stylish));
});

var reporter = 'spec';

gulp.task('mocha', ['jshint'], function() {
    return gulp.src([
        './test/setup/node.js',
        './test/setup/helpers.js',
        './test/unit/**/*.js'
    ], { read: false })
        .pipe($.plumber())
        .pipe($.mocha({ reporter: reporter }));
});

gulp.task('build', [
    'clean',
    'html',
    'styles',
    'scripts',
    'additional',
    'test',
    'refresh'
]);

gulp.task('test', [
    'jshint',
    'mocha'
]);

gulp.task('watch', ['build'], function() {
    browserSync.init({
        open: "external",
        // server: {
        //   baseDir: 'dist',
        //   middleware: function(req, res, next) {
        //     api(req, res, next);
        //   }
        // }
    });

    reporter = 'dot';
    bundler(true).on('update', function() {
        gulp.start('scripts-refresh');
        gulp.start('test');
    });
    gulp.watch('./test/**/*.js', ['test']);
    gulp.watch(['./src/main.less', './src/**/*.less'], ['styles-refresh']);
    gulp.watch(['./src/*.html'], ['html-refresh']);
    gulp.watch(['./src/additional/*.js'], ['additional-refresh']);
});

gulp.task('default', ['watch']);
