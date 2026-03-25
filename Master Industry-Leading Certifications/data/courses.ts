import type { Course } from './types';
import { cmrpCourse } from './courses/cmrp';
import { camaCourse } from './courses/cama';
import { creCourse } from './courses/cre';
import { pmpCourse } from './courses/pmp';
import { lssCourse } from './courses/lss';
import { mltCourse } from './courses/mlt';
import { crlCourse } from './courses/crl';

export const courses: Course[] = [
  cmrpCourse,
  camaCourse,
  creCourse,
  pmpCourse,
  lssCourse,
  mltCourse,
  crlCourse,
];