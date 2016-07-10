"use strict";

var gulp = require('gulp'),
  	gutil = require('gulp-util'),
  	plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    sh = require('shelljs'),
    shell = require('gulp-shell'),
    concat = require('gulp-concat'),
    uglify  = require('gulp-uglify'),

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
    DIST_DIR = 'dist',
    DIST_NAME = 'f.js',
    DIST_MIN_NAME = 'f.min.js',
    DIST_PATH = DIST_DIR +'/'+ DIST_NAME,
    DIST_MIN_PATH = DIST_DIR +'/'+ DIST_MIN_NAME;

var onError = function(error){
  	gutil.beep();
  	console.log(error);
};

function readFile(filePath) {
    return _fs.readFileSync(filePath, FILE_ENCODING);
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

gulp.task('default', ['lint', 'purge-deploy', 'build']);

gulp.task('purge-deploy', function(){
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
            dispatcher : readFile('src/lib/dispatcher.js'),
            injector   : readFile('src/lib/injector.js'),
            router     : readFile('src/lib/router.js'),
            core       : readFile('src/core.js'),
            sandbox    : readFile('src/sandbox.js'),
            store      : readFile('src/store.js'),
            extension  : readFile('src/extension.js'),
            module     : readFile('src/module.js')
        }, /\/\/::(\w+)::\/\//g);
    _fs.writeFileSync(DIST_PATH, tmpl(deploy, _replacements), FILE_ENCODING);
});

gulp.task('minify', function(){
    gulp.src(['dist/f.js'])
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(concat('f.min.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function(){
	gulp.watch('src/**/*.*', ['default']);
});

gulp.task('lint', function(){
    return gulp.src('./src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
