var gulp = require('gulp');
var fs = require('fs');
var path = require('path');

//把普通的Node Stream转换为Vinyl File Object Stream
var vinyl_source_stream = require('vinyl-source-stream');
//接收Vinyl File Object作为输入，然后判断其contents类型，如果是Stream就转换为Buffer。
var vinyl_buffer = require('vinyl-buffer');


//文件不存在时报错，检查期望的文件是否都存在
var expect = require('gulp-expect-file');
// 期望文件 配置属性.
const EXPECT_OPTIONS = {
	silent: true,
	errorOnFailure: true,
	checkRealFile: true
};
//添加文件头
var header = require('gulp-header');

//压缩js
var uglify = require('gulp-uglify');
//更改文件名
var rename = require('gulp-rename');

//检查js是否规范
var jshint = require('gulp-jshint');

//打包成浏览器使用的版本
var browserify = require('browserify');


const PKG = require('./package.json');

// 打包时自动生成注释头部.
const BANNER = fs.readFileSync('banner.txt').toString();
const BANNER_OPTIONS = {
	pkg: PKG,
	currentYear: (new Date()).getFullYear()
};


gulp.task('lint', function() {
	var src = ['gulpfile.js', 'src/*.js'];

	return gulp.src(src)
		.pipe(expect(EXPECT_OPTIONS, src))
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish', {verbose: true}))
		.pipe(jshint.reporter('fail'));
});

gulp.task('browserify', function() {
	return browserify([path.join(__dirname, PKG.main)], {
		standalone: PKG.title
	}).bundle()
		.pipe(vinyl_source_stream(PKG.name + '.js'))
		.pipe(vinyl_buffer())
		.pipe(header(BANNER, BANNER_OPTIONS))
		.pipe(gulp.dest('dist/'));
});

gulp.task('uglify', function() {
	var src = 'dist/' + PKG.name + '.js';

	return gulp.src(src)
		.pipe(expect(EXPECT_OPTIONS, src))
		.pipe(uglify())
		.pipe(header(BANNER, BANNER_OPTIONS))
		.pipe(rename(PKG.name + '.min.js'))
		.pipe(gulp.dest('dist/'));
});


gulp.task('dist', gulp.series('lint', 'browserify', 'uglify'));
gulp.task('default', gulp.series('dist'));






