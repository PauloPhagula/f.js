var gulp = require('gulp'),
	gutil = require('gulp-util'),
	plumber = require('gulp-plumber'),
	babel = require('babelify'), //require('gulp-babel'),
	traceur = require('gulp-traceur'),
  jshint = require('gulp-jshint'),
	sourcemaps = require('gulp-sourcemaps'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	browserify = require('browserify'),
	watchify = require('watchify'),
  sh = require('shelljs'),
  shell = require('gulp-shell')
;

var onError = function(error){
	gutil.beep();
	console.log(error);
}

function compile(watch) {
  var bundler = watchify(browserify('./src/f.js', { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('f.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

function watch() {
  return compile(true);
};

gulp.task('build', function() { return compile(); });

gulp.task('default', function(){
	gulp.src('src/**/*.js')
		.pipe(plumber({errorHandler: onError}))
		// .pipe(traceur({sourceMap: true, experimental: true, modules: 'amd', blockBinding: true}))
		.pipe(babel({modules: 'umd'}))
		.pipe(gulp.dest('dist/'));
});

gulp.task('watch', function(){
	gulp.watch('src/**/*.*', ['default']);
})

// Additional tasks
// Bundle and minify all js
gulp.task('scripts', shell.task([
  'cd src; r.js -o build-config.js'
  ])
);


gulp.task('lint', function(){
  return gulp.src('./src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});