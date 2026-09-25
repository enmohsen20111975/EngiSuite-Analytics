import type { Lesson, CaseStudy } from '../../types';

const caseStudies: CaseStudy[] = [
    {
        "id": 1,
        "domain": "DMAIC (Manufacturing)",
        "industry": "Automotive",
        "title": "Ford Motor Co. – Reducing Engine Assembly Defects",
        "summary": "A classic Six Sigma project to reduce defects in engine assembly using the DMAIC framework.",
        "details": [
            "Define: Chartered the project with a clear goal to reduce warranty claims by 50%.",
            "Measure: Collected baseline data and found a Cpk of 0.6.",
            "Analyze: Used Pareto charts and Fishbone diagrams to find root causes in torque tool calibration.",
            "Improve/Control: Implemented new calibration procedures and control charts, achieving a Cpk of 1.5."
        ],
        "image": "https://i.ibb.co/kH7qG5J/ford-engine.png"
    },
    {
        "id": 2,
        "domain": "DMAIC (Service/Healthcare)",
        "industry": "Healthcare",
        "title": "Virginia Mason Medical Center – Reducing Patient Wait Times",
        "summary": "Applying Lean principles to streamline the patient journey in a clinic.",
        "details": [
            "Define: Mapped the patient value stream and identified long wait times as a major source of waste.",
            "Measure: Timed each step of the process, confirming 90% of visit time was non-value-added.",
            "Analyze: Identified bottlenecks in room availability and paperwork.",
            "Improve/Control: Redesigned clinic layout and standardized workflows, cutting average visit time by 40%."
        ],
        "image": "https://i.ibb.co/3s2Rz6X/virginia-mason.png"
    },
    {
        "id": 3,
        "domain": "DMAIC (Transactional)",
        "industry": "Financial Services",
        "title": "Bank of America – Streamlining Mortgage Applications",
        "summary": "Using Lean Six Sigma to reduce the cycle time for processing mortgage applications.",
        "details": [
            "Define: The problem was a 45-day average cycle time, causing customer dissatisfaction.",
            "Measure: Process mapping revealed multiple handoffs and redundant checks.",
            "Analyze: Data analysis showed that missing documentation was the biggest cause of delays.",
            "Improve/Control: Created a standardized checklist for applicants and an improved workflow, reducing cycle time to under 25 days."
        ],
        "image": "https://i.ibb.co/kS1P8qB/bank-of-america.png"
    }
];

export const caseStudiesModule: Lesson = {
    id: 'lss-6',
    title: 'Interactive: Case Studies',
    prompt: '',
    moduleType: 'caseStudies',
    objectives: [
        "Analyze the application of the DMAIC framework in diverse industries.",
        "Identify how Lean and Six Sigma tools are used in each phase of a project.",
        "Evaluate the business impact and sustainability of process improvement projects."
    ],
    cases: caseStudies,
};