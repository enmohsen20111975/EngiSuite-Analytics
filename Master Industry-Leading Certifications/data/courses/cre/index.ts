import type { Course } from '../../types';
import { lesson1 } from './lesson1';
import { lesson2 } from './lesson2';
import { lesson3 } from './lesson3';
import { lesson4 } from './lesson4';
import { examBankModule } from './interactive-exambank';
import { caseStudiesModule } from './interactive-casestudies';
import { formulasModule } from './interactive-formulas';
import { cheatsheetsModule } from './interactive-cheatsheets';
import { flashcardsModule } from './interactive-flashcards';

export const creCourse: Course = {
    id: 'cre',
    title: 'CRE (Certified Reliability Engineer)',
    description: 'Explore the principles of performance evaluation and prediction to improve product/systems safety, reliability, and maintainability.',
    lessons: [
      lesson1,
      lesson2,
      lesson3,
      lesson4,
      caseStudiesModule,
      cheatsheetsModule,
      flashcardsModule,
      formulasModule,
      examBankModule,
    ]
};
