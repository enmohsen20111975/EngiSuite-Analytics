import type { Lesson, CaseStudy } from '../../types';

const caseStudies: CaseStudy[] = [
    {
        "id": 1,
        "domain": "Contamination Control",
        "industry": "Pulp & Paper",
        "title": "Paper Mill – Hydraulic System Reliability",
        "summary": "Implementing a world-class contamination control program to improve hydraulic system uptime.",
        "details": [
            "Installed desiccant breathers and high-efficiency filters on all hydraulic reservoirs.",
            "Established a goal to keep fluids 'clean, cool, and dry'.",
            "Used oil analysis to track cleanliness levels (ISO particle counts).",
            "Reduced hydraulic failures by 80% and saved over $500k annually."
        ],
        "image": "https://i.ibb.co/L5rK3gY/paper-mill.png"
    },
    {
        "id": 2,
        "domain": "Oil Analysis",
        "industry": "Mining",
        "title": "Syncrude – Predictive Failure Detection",
        "summary": "Using oil analysis to predict haul truck engine failures and optimize maintenance.",
        "details": [
            "Routine oil sampling detected abnormal levels of coolant (glycol) in engine oil.",
            "Early detection allowed for a planned engine overhaul, avoiding catastrophic failure in the field.",
            "Saved an estimated $1.2M on a single 'catch' by preventing secondary damage.",
            "Demonstrated the high ROI of a proactive oil analysis program."
        ],
        "image": "https://i.ibb.co/Wc63c3t/syncrude-mining.png"
    },
    {
        "id": 3,
        "domain": "Lubricant Application",
        "industry": "Food & Beverage",
        "title": "Tropicana – Precision Greasing Program",
        "summary": "Moving from time-based to condition-based greasing using ultrasonic technology.",
        "details": [
            "Technicians were over-greasing motor bearings, leading to high failure rates.",
            "Implemented ultrasonic grease guns that 'listen' to the bearing's friction levels.",
            "Grease is only added when the decibel level indicates a need, preventing over-lubrication.",
            "Motor bearing failures dropped by over 90% in the first year."
        ],
        "image": "https://i.ibb.co/6y4t4mP/tropicana-plant.png"
    }
];

export const caseStudiesModule: Lesson = {
    id: 'mlt-5',
    title: 'Interactive: Case Studies',
    prompt: '',
    moduleType: 'caseStudies',
    objectives: [
        "Analyze real-world lubrication program successes and failures.",
        "Connect lubrication fundamentals to tangible reliability outcomes.",
        "Evaluate the financial and operational impact of best practices in lubrication."
    ],
    cases: caseStudies,
};