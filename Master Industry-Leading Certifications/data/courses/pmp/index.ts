import type { Course } from '../../types';
import { domain1 } from './domain1';
import { domain2 } from './domain2';
import { domain3 } from './domain3';
import { domain2Risk } from './domain2-risk';
import { caseStudiesModule } from './interactive-casestudies';
import { formulasModule } from './interactive-formulas';
import { examBankModule } from './interactive-exambank';
import { cheatsheetsModule } from './interactive-cheatsheets';
import { flashcardsModule } from './interactive-flashcards';

export const pmpCourse: Course = {
    id: 'pmp',
    title: 'PMP (Project Management Professional)',
    description: 'Learn the core competencies of project management, including people, process, and business environment.',
    lessons: [
       domain1,
       domain2,
       domain2Risk,
       domain3,
       caseStudiesModule,
       cheatsheetsModule,
       flashcardsModule,
       formulasModule,
       examBankModule,
    ]
};
