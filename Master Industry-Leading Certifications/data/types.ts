export interface TextContent {
  type: 'text';
  body: string;
}

export interface QuizContent {
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export type VisualComponentType = 
    'OeeChart' | 'PFCurve' | 'WorkManagementCycle' | 'FourFundamentals' | 'LineOfSight' | 'RiskMatrix' |
    'BathtubCurve' | 'SeriesRBD' | 'ParallelRBD' | 'DeratingGraph' | 'PowerInterestGrid' |
    'CriticalPathDiagram' | 'BenefitsFlowchart' | 'RpnEquation' | 'AvailabilityEquation' |
    'OeeEquation' | 'CpiEquation' | 'SpiEquation' | 'LccComparisonChart' | 'SixBigLossesDiagram' |
    'FishboneDiagram' | 'MaintenanceStrategyMatrix' | 'TuckmanLadder' | 'WrenchTimeChart' |
    'PdcaCycle' | 'BowTieAnalysis' | 'ParetoChart' | 'PughMatrix' | 'ControlChart' |
    'LubricationRegimes' | 'GreaseGunDiagram' | 'SinglePointLubricator' | 'BetaRatioChart' |
    'LubeStorageDiagram' | 'OilAnalysisReport' | 'ProbabilityImpactMatrix' | 'EmvEquation';

export interface VisualContent {
    type: 'visual';
    component: VisualComponentType;
}

export type ContentBlock = TextContent | QuizContent | VisualContent;

// --- NEW TYPES FOR INTERACTIVE MODULES ---
export interface CaseStudy {
  id: number;
  domain: string;
  industry: string;
  title: string;
  summary: string;
  details: string[];
  image: string;
}

export interface Cheatsheet {
  id: number;
  domain: string;
  title: string;
  summary: string;
  highlights: string[];
  image: string;
}

export interface ExamQuestion {
  id: number;
  domain: string;
  q: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Flashcard {
  id: number;
  domain: string;
  q: string;
  a: string;
}

export interface Formula {
  id: number;
  domain:string;
  title: string;
  formula: string;
  description: string;
  example: string;
  image: string;
}

export type ModuleType = 'standard' | 'caseStudies' | 'cheatsheets' | 'examBank' | 'flashcards' | 'formulas';

export interface Lesson {
  id: string;
  title:string;
  prompt: string; // Kept for consistency, but unused for new types
  isComingSoon?: boolean;
  moduleType?: ModuleType;
  objectives?: string[];
  content?: ContentBlock[];
  sources?: {
    title: string;
    uri: string;
  }[];
  // New data properties for modules
  cases?: CaseStudy[];
  cheatsheets?: Cheatsheet[];
  questions?: ExamQuestion[];
  flashcards?: Flashcard[];
  formulas?: Formula[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
