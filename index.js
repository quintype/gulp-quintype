var gulp = require('gulp');
var sass = require('gulp-sass');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var mergeStream = require('merge-stream');
var util = require('gulp-util');
var minify = require('gulp-minify');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var del = require('del');

var _ = require('lodash');

function outputLog(message) {
  return function() {
    util.log(message)
  };
}

function compileSass(file, opts) {
  var production = !!util.env.production;
  return gulp.src(file)
    .pipe(production ? util.noop() : sourcemaps.init())
    .pipe(sass(_.extend({
      outputStyle: production ? 'compressed' : 'nested'
    }, opts)).on("error", sass.logError))
    .pipe(production ? util.noop() : sourcemaps.write())
    .on("end", outputLog("SASSified:        " + file));
}

function compileJS(file, name, opts) {
  var production = !!util.env.production;

  return browserify(_.extend({
    entries: file
  }, opts)).bundle()
    .pipe(source(name))
    .pipe(buffer())
    .pipe(production ? util.noop() : sourcemaps.init())
    .pipe(production ? uglify() : util.noop())
    .pipe(production ? util.noop() : sourcemaps.write())
    .on("end", outputLog("Browserified:     " + file));
}

function files(regex) {
  return gulp.src(regex);
}

function manifestAndWrite(destination, pipes) {
   return pipes
    .pipe(rev())
    .pipe(revReplace())
    .pipe(gulp.dest(destination))
    .pipe(rev.manifest())
    .pipe(gulp.dest(destination))
    .on("end", outputLog("Manifestified:    " + destination + "/rev-manifest.json"));
};

module.exports = {
  sass: compileSass,
  browserify: compileJS,
  merge: mergeStream,
  files: files,
  manifestAndWrite: manifestAndWrite,
  log: outputLog
};
