import { src, dest, watch, series } from 'gulp';
import sass from 'gulp-sass';

function buildStyles() {
  return src('/assets/index.scss')
    .pipe(sass())
    .pipe(dest('/assets/css'));
}

function watchTask() {
  watch(['/assets/index.scss'], buildStyles);
}

export default series(buildStyles, watchTask);
