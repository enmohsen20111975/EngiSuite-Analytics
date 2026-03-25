import type { Course, CaseStudy, Cheatsheet, ExamQuestion, Flashcard, Formula } from '../../types';
import { pillar1 } from './pillar1';
import { pillar2 } from './pillar2';
import { pillar3 } from './pillar3';
import { pillar4 } from './pillar4';
import { pillar5 } from './pillar5';
import { caseStudiesModule } from './interactive-casestudies';
import { cheatsheetsModule } from './interactive-cheatsheets';
import { examBankModule } from './interactive-exambank';
import { flashcardsModule } from './interactive-flashcards';
import { formulasModule } from './interactive-formulas';


export const cmrpCourse: Course = {
    id: 'cmrp',
    title: 'CMRP (Certified Maintenance & Reliability Professional)',
    description: 'Master the 5 pillars of the SMRP Body of Knowledge, from business management to equipment reliability.',
    lessons: [
      pillar1,
      pillar2,
      pillar3,
      pillar4,
      pillar5,
      caseStudiesModule,
      cheatsheetsModule,
      examBankModule,
      flashcardsModule,
      formulasModule,
    ]
  };