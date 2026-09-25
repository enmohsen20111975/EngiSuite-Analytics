import type { Course } from '../../types';
import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { module5 } from './module5';
import { module6 } from './module6';
import { module7 } from './module7';
import { caseStudiesModule } from './interactive-casestudies';
import { formulasModule } from './interactive-formulas';
import { examBankModule } from './interactive-exambank';
import { cheatsheetsModule } from './interactive-cheatsheets';
import { flashcardsModule } from './interactive-flashcards';

export const camaCourse: Course = {
  id: 'cama',
  title: 'CAMA (Certified Asset Management Assessor)',
  description: 'Deep dive into asset management principles, frameworks, and assessment based on ISO 55001.',
  lessons: [
    module1,
    module2,
    module3,
    module4,
    module5,
    module6,
    module7,
    caseStudiesModule,
    cheatsheetsModule,
    flashcardsModule,
    formulasModule,
    examBankModule,
  ],
};
