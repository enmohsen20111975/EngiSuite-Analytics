import type { Course } from '../../types';
import { fundamentals } from './fundamentals';
import { application } from './application';
import { contamination } from './contamination';
import { analysis } from './analysis';
import { caseStudiesModule } from './interactive-casestudies';
import { formulasModule } from './interactive-formulas';
import { examBankModule } from './interactive-exambank';
import { cheatsheetsModule } from './interactive-cheatsheets';
import { flashcardsModule } from './interactive-flashcards';

export const mltCourse: Course = {
  id: 'mlt',
  title: 'Machinery Lubrication (MLT I)',
  description: 'Build a strong foundation in lubrication fundamentals, application methods, and contamination control to improve machine reliability.',
  lessons: [
    fundamentals,
    application,
    contamination,
    analysis,
    caseStudiesModule,
    cheatsheetsModule,
    flashcardsModule,
    formulasModule,
    examBankModule,
  ],
};
