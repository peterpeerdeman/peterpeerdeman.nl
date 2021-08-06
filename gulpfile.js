const { src, dest, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));

// var deploy = require("gulp-gh-pages");
// var connect = require("gulp-connect");
//
// gulp.task("connect", function () {
//   connect.server({
//     root: "dist",
//     livereload: true,
//   });
// });
//
// gulp.task("watch", function () {
//   gulp.watch(["./src#<{(|.html", "./src/sass#<{(|.sass"], ["statics", "styles"]);
// });
//
// gulp.task("statics", function () {
//   gulp
//     .src(["src#<{(|.*", "src/img#<{(|*", "src/fonts#<{(|*"], { base: "src" })
//     .pipe(gulp.dest("dist"))
//     .pipe(connect.reload());
// });
//
// gulp.task("styles", function () {
//   return gulp
//     .src("./src/sass/index.sass")
//     .pipe(
//       sass({
//         includePaths: require("node-normalize-scss").includePaths,
//         outputStyle: "compressed",
//       }).on("error", sass.logError)
//     )
//     .pipe(gulp.dest("dist/css"))
//     .pipe(connect.reload());
// });
//
// gulp.task("deploy", function () {
//   return gulp.src("./dist#<{(||)}>#*").pipe(deploy());
// });
// gulp.task('default', ['statics', 'styles', 'connect', 'watch']);

function defaultTask(cb) {
  // place code for your default task here
  //   gulp
  cb();
}

function statics(cb) {
  return src(["src/*.*", "src/img/**", "src/fonts/**"], { base: "src" }).pipe(
    dest("dist/")
  );
}

function styles(cb) {
  return src("./src/sass/index.sass")
    .pipe(
      sass({
        includePaths: require("node-normalize-scss").includePaths,
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(dest("dist/css"));
}

exports.default = series(statics, styles);
