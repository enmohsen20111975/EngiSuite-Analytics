export const CERTIFICATIONS = [
  {
    id: 'cmrp',
    title: 'CMRP (Certified Maintenance & Reliability Professional)',
    shortTitle: 'CMRP',
    description: 'Master the five pillars of the SMRP Body of Knowledge, from business management to equipment reliability.',
    icon: 'award',
    color: 'green',
    status: 'available',
    level: 'professional',
    duration: '40 hours',
    totalLessons: 50,
    learningObjects: [
      { title: 'Business Management', description: 'Financial analysis, KPIs, and asset strategy.' },
      { title: 'Equipment Reliability', description: 'RCM, FMEA, and predictive maintenance.' },
      { title: 'People and Organization', description: 'Leadership, communication, and team management.' },
      { title: 'Work Management', description: 'Planning, scheduling, and work execution control.' },
      { title: 'Manufacturing Process Reliability', description: 'Process optimization and quality improvement.' }
    ],
    features: ['5 SMRP pillars', 'Industry-recognized path', 'Reliability leadership focus']
  },
  {
    id: 'cama',
    title: 'CAMA (Certified Asset Management Assessor)',
    shortTitle: 'CAMA',
    description: 'Build a strong command of ISO 55001 asset management principles, assessments, and lifecycle decision-making.',
    icon: 'chartColumn',
    color: 'blue',
    status: 'available',
    level: 'intermediate',
    duration: '30 hours',
    totalLessons: 30,
    learningObjects: [
      { title: 'ISO 55001 Framework', description: 'Core asset management principles and structure.' },
      { title: 'Asset Lifecycle Management', description: 'Planning, acquisition, operation, and renewal.' },
      { title: 'Performance Assessment', description: 'KPIs, benchmarking, and audit readiness.' },
      { title: 'Financial Optimization', description: 'Value, cost, and return-on-investment analysis.' },
      { title: 'Risk Management', description: 'Risk identification, prioritization, and treatment.' }
    ],
    features: ['ISO 55001 aligned', 'Assessment-driven learning', 'Decision-support methods']
  },
  {
    id: 'cre',
    title: 'CRE (Certified Reliability Engineer)',
    shortTitle: 'CRE',
    description: 'Study the methods used to improve product and system safety, reliability, maintainability, and performance prediction.',
    icon: 'activity',
    color: 'purple',
    status: 'available',
    level: 'advanced',
    duration: '35 hours',
    totalLessons: 35,
    learningObjects: [
      { title: 'Reliability Statistics', description: 'Weibull analysis, distributions, and failure behavior.' },
      { title: 'Performance Prediction', description: 'MTBF, MTTR, and reliability modeling.' },
      { title: 'Design for Reliability', description: 'FMEA, DFA, and robust design methods.' },
      { title: 'Testing and Validation', description: 'Accelerated life testing and verification planning.' },
      { title: 'Safety and Risk Assessment', description: 'FTA, criticality analysis, and risk reduction.' }
    ],
    features: ['Exam-oriented coverage', 'Strong analytical depth', 'Reliability engineering toolkit']
  },
  {
    id: 'pmp',
    title: 'PMP (Project Management Professional)',
    shortTitle: 'PMP',
    description: 'Learn the core competencies of project management across people, process, delivery, and business context.',
    icon: 'bookmark',
    color: 'indigo',
    status: 'available',
    level: 'intermediate',
    duration: '45 hours',
    totalLessons: 45,
    learningObjects: [
      { title: 'People Management', description: 'Leadership, collaboration, and conflict resolution.' },
      { title: 'Process Management', description: 'Planning, execution, and control methods.' },
      { title: 'Business Environment', description: 'Value delivery, governance, and compliance.' },
      { title: 'Agile Practices', description: 'Scrum, Kanban, and hybrid delivery models.' },
      { title: 'Risk and Stakeholder Management', description: 'Communication strategy and risk response planning.' }
    ],
    features: ['PMI-style preparation', 'Project delivery focus', 'Agile and predictive coverage']
  },
  {
    id: 'lean-six-sigma',
    title: 'Lean Six Sigma Green Belt',
    shortTitle: 'Lean Six Sigma',
    description: 'Use DMAIC and lean methods to reduce variation, eliminate waste, and improve operational performance.',
    icon: 'circle',
    color: 'emerald',
    status: 'available',
    level: 'intermediate',
    duration: '50 hours',
    totalLessons: 50,
    learningObjects: [
      { title: 'DMAIC Methodology', description: 'Define, Measure, Analyze, Improve, and Control.' },
      { title: 'Waste Elimination', description: 'Lean principles and the eight wastes.' },
      { title: 'Variation Reduction', description: 'SPC, sigma thinking, and capability analysis.' },
      { title: 'Root Cause Analysis', description: 'Fishbone diagrams, 5 Whys, and fault logic.' },
      { title: 'Process Control', description: 'Control plans, monitoring, and sustainment.' }
    ],
    features: ['Process improvement focus', 'Data-driven decisions', 'Strong practical toolkit']
  },
  {
    id: 'mlt-i',
    title: 'MLT I (Machinery Lubrication Technician)',
    shortTitle: 'MLT I',
    description: 'Build a strong foundation in lubrication fundamentals, contamination control, and oil analysis to improve machine reliability.',
    icon: 'wrench',
    color: 'teal',
    status: 'available',
    level: 'beginner',
    duration: '25 hours',
    totalLessons: 25,
    learningObjects: [
      { title: 'Lubrication Fundamentals', description: 'Oil types, properties, and selection criteria.' },
      { title: 'Application Methods', description: 'Manual, automatic, and controlled delivery methods.' },
      { title: 'Contamination Control', description: 'Filtration, handling, and storage best practices.' },
      { title: 'Oil Analysis', description: 'Sampling, testing, and condition interpretation.' },
      { title: 'Reliability Improvement', description: 'Program design and continuous improvement.' }
    ],
    features: ['Machine reliability focus', 'Lubrication best practices', 'Condition monitoring basics']
  },
  {
    id: 'crl',
    title: 'CRL (Certified Reliability Leader)',
    shortTitle: 'CRL',
    description: 'Develop the strategy, culture, and leadership capability needed to move an organization toward world-class reliability.',
    icon: 'star',
    color: 'rose',
    status: 'available',
    level: 'advanced',
    duration: '40 hours',
    totalLessons: 40,
    learningObjects: [
      { title: 'Leadership Vision', description: 'Reliability culture and long-term strategic thinking.' },
      { title: 'Business Case Development', description: 'ROI, value storytelling, and executive alignment.' },
      { title: 'Change Management', description: 'Adoption planning and stakeholder engagement.' },
      { title: 'Performance Metrics', description: 'KPIs, scorecards, and benchmarking.' },
      { title: 'Team Development', description: 'Capability building and coaching systems.' }
    ],
    features: ['Leadership-centered path', 'Business impact framing', 'Culture and execution alignment']
  }
];