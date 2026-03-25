import type { Course } from '../../types';
import { dmaic1 } from './dmaic1';
import { dmaic2 } from './dmaic2';
import { dmaic3 } from './dmaic3';
import { dmaic4 } from './dmaic4';
import { dmaic5 } from './dmaic5';
import { caseStudiesModule } from './interactive-casestudies';
import { formulasModule } from './interactive-formulas';
import { examBankModule } from './interactive-exambank';
import { cheatsheetsModule } from './interactive-cheatsheets';
import { flashcardsModule } from './interactive-flashcards';

export const lssCourse: Course = {
  id: 'lss',
  title: 'Lean Six Sigma Green Belt',
  description: 'Master the DMAIC methodology to lead process improvement projects, eliminate waste, and reduce variation.',
  lessons: [
    dmaic1,
    dmaic2,
    dmaic3,
    dmaic4,
    dmaic5,
    caseStudiesModule,
    cheatsheetsModule,
    flashcardsModule,
    formulasModule,
    examBankModule,
  ],
};
