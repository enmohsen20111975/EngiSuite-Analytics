import type { Lesson, CaseStudy } from '../../types';

const caseStudies: CaseStudy[] = [
    {
        "id": 1,
        "domain": "Reliability Modeling & DfR",
        "industry": "Aerospace",
        "title": "NASA Mars Rover – Redundancy Design",
        "summary": "Designing for extreme reliability in an environment where repair is impossible.",
        "details": [
            "Extensive use of parallel redundancy for critical systems (e.g., computers, mobility).",
            "Rigorous FMECA process to identify and mitigate every conceivable failure mode.",
            "Fault Tree Analysis used to understand system-level risks from component failures.",
            "Resulted in missions lasting years beyond their initial design life."
        ],
        "image": "https://i.ibb.co/mHqJ5T7/mars-rover.png"
    },
    {
        "id": 2,
        "domain": "Design for Reliability (DfR)",
        "industry": "Automotive Electronics",
        "title": "Bosch – HALT for ECU Robustness",
        "summary": "Using Highly Accelerated Life Testing (HALT) to improve the durability of Engine Control Units (ECUs).",
        "details": [
            "HALT subjected ECUs to extreme temperature and vibration cycles to find weak points.",
            "Identified weak solder joints and component vulnerabilities not found in standard testing.",
            "Design improvements led to a 60% reduction in early-life warranty claims.",
            "Established operational limits far beyond specified requirements."
        ],
        "image": "https://i.ibb.co/8DBZ21Q/bosch-ecu.png"
    },
    {
        "id": 3,
        "domain": "Reliability Modeling & Prediction",
        "industry": "Medical Devices",
        "title": "Medtronic – Pacemaker Reliability",
        "summary": "Applying Weibull analysis and reliability modeling to ensure the safety and longevity of pacemakers.",
        "details": [
            "Weibull analysis of component failure data to accurately predict device lifespan.",
            "Used Physics-of-Failure to understand battery degradation mechanisms.",
            "Achieved reliability levels exceeding 'six nines' (99.9999%).",
            "Data used to set safe replacement intervals and inform regulatory bodies."
        ],
        "image": "https://i.ibb.co/L5hY5Xn/medtronic-pacemaker.png"
    },
    {
      "id": 4,
      "domain": "Failure Analysis Techniques",
      "industry": "Aviation",
      "title": "Boeing 737 MAX – Systemic Failure Analysis",
      "summary": "Post-accident investigation using FTA and RCA to understand the complex interaction of software, hardware, and human factors.",
      "details": [
        "Fault Tree Analysis revealed a single-point-of-failure sensor design.",
        "Root Cause Analysis identified gaps in system safety assessment and pilot training.",
        "Led to a complete redesign of the MCAS software and certification processes.",
        "Highlighted the importance of integrating human factors into reliability analysis."
      ],
      "image": "https://i.ibb.co/51f4z2g/boeing-737.png"
    }
];

export const caseStudiesModule: Lesson = {
    id: 'cre-5',
    title: 'Interactive: Case Studies',
    prompt: '',
    moduleType: 'caseStudies',
    objectives: [
        "Analyze real-world applications of reliability engineering principles.",
        "Connect theoretical models (RBD, Weibull) to practical product design challenges.",
        "Evaluate the outcomes of different DfR and failure analysis strategies."
    ],
    cases: caseStudies,
};