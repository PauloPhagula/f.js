'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    eslint = require('gulp-eslint'),
    sh = require('shelljs'),
    shell = require('gulp-shell'),
    concat = require('gulp-concat'),
    uglify  = require('gulp-uglify'),
    jsdoc = require("gulp-jsdoc3"),

    _pkg = require('./package.json'),
    _fs = require('fs'),
    _path = require('path'),
    _now = new Date(),
    _replacements = {
        NAME : _pkg.name,
        DESCRIPTION: _pkg.description,
        AUTHOR : _pkg.author.name,
        AUTHOR_URL: _pkg.author.url,
        VERSION_NUMBER : _pkg.version,
        HOMEPAGE : _pkg.homepage,
        LICENSE : _pkg.license,
        BUILD_DATE : _now.getUTCFullYear() +'/'+ pad(_now.getUTCMonth() + 1) +'/'+ pad(_now.getUTCDate()) +' '+ pad(_now.getUTCHours()) +':'+ pad(_now.getUTCMinutes())
    };
;

var FILE_ENCODING = 'utf-8',
    SRC_DIR = 'src',
    DIST_DIR = 'builds',
    DIST_NAME = 'f.js',
    DIST_MIN_NAME = 'f.min.js',
    DIST_PATH = _path.resolve(__dirname,  DIST_DIR + '/' + DIST_NAME),
    DIST_MIN_PATH = _path.resolve(__dirname, DIST_DIR + '/' + DIST_MIN_NAME),
    DOC_PATH = _path.resolve(__dirname, 'docs');

var onError = function(error){
  	gutil.beep();
  	console.log(error);
};

function readFile(filePath) {
    var fullFilePath = _path.resolve(__dirname, filePath);
    return _fs.readFileSync(fullFilePath, FILE_ENCODING);
}

function tmpl(template, data, regexp){
    function replaceFn(match, prop){
        return (prop in data)? data[prop] : '';
    }
    return template.replace(regexp || /::(\w+)::/g, replaceFn);
}

function pad(val){
    val = String(val);
    if (val.length < 2) {
        return '0'+ val;
    } else {
        return val;
    }
}

gulp.task('default', ['purge-build', 'build', 'lint', 'test']);

gulp.task('purge-build', function(){
    [DIST_PATH, DIST_MIN_PATH].forEach(function(filePath){
        if( _fs.existsSync(filePath) ){
            _fs.unlinkSync(filePath);
        }
    });
});

gulp.task('build', function(){
    var wrapper = readFile('src/wrapper.js'),
        deploy  = tmpl(wrapper, {
            f          : readFile('src/f.js'),
            dispatcher : readFile('src/dispatcher.js'),
            injector   : readFile('src/injector.js'),
            core       : readFile('src/core.js'),
            sandbox    : readFile('src/sandbox.js'),
            module     : readFile('src/module.js')
        }, /\/\/::(\w+)::\/\//g);
    _fs.writeFileSync(DIST_PATH, tmpl(deploy, _replacements), FILE_ENCODING);
});

gulp.task('minify', function(){
    return gulp.src([DIST_PATH])
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(concat(DIST_MIN_NAME))
        .pipe(gulp.dest(DIST_DIR));
});

gulp.task('watch', function(){
	gulp.watch('src/**/*.*', ['default']);
});

gulp.task('lint', function(){
    gulp.src(['./builds/f.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('doc', function(cb){
    gulp.src(['./README.rst', DIST_PATH], {read: false})
        .pipe(jsdoc(cb));
});

gulp.task('test', function(done){
    return sh.exec("./node_modules/.bin/karma start karma.conf.js --single-run", done);
});
