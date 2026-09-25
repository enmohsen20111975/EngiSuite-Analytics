import type { Lesson, Cheatsheet } from '../../types';

const cheatsheets: Cheatsheet[] = [
    {
        "id": 1,
        "domain": "Core Concepts",
        "title": "The 4 Fundamentals of Asset Management",
        "summary": "The core principles from ISO 55000 that underpin a successful Asset Management System.",
        "highlights": [
            "Value: Assets exist to provide value to the organization and its stakeholders.",
            "Alignment: AM decisions must be aligned with organizational strategic goals.",
            "Leadership: Top management commitment is essential for success.",
            "Assurance: The AMS must provide assurance that assets will achieve their purpose."
        ],
        "image": "https://i.ibb.co/VMyLd1f/cama-fundamentals.png"
    },
    {
        "id": 2,
        "domain": "Planning",
        "title": "The 'Line of Sight'",
        "summary": "Visualizing the cascade from high-level strategy to daily operational activities.",
        "highlights": [
            "Starts with the Organizational Strategic Plan (corporate goals).",
            "Flows to the Strategic Asset Management Plan (SAMP).",
            "Informs the detailed Asset Management Plans (AMPs).",
            "Guides specific asset activities (e.g., maintenance tasks)."
        ],
        "image": "https://i.ibb.co/fvr3QZd/scope.png"
    },
    {
        "id": 3,
        "domain": "Planning",
        "title": "SAMP vs. AM Plan",
        "summary": "Understanding the difference between the strategic (SAMP) and tactical (AMP) plans.",
        "highlights": [
            "SAMP: Why & What. Long-term, strategic, covers the entire AMS.",
            "AMP: How & Who. Tactical, asset-specific, details activities, resources, and timelines.",
            "The SAMP sets the direction for multiple AM Plans."
        ],
        "image": "https://i.ibb.co/8spCSMW/strategic-alignment.png"
    },
    {
        "id": 4,
        "domain": "Risk Management",
        "title": "Risk Management Process",
        "summary": "A structured approach to managing uncertainty in asset management.",
        "highlights": [
            "Identify Risks: What can happen?",
            "Analyze Risks: How likely is it and what are the consequences? (Use Risk Matrix).",
            "Evaluate Risks: Is the risk level acceptable?",
            "Treat Risks: Apply controls to mitigate, avoid, transfer, or accept the risk."
        ],
        "image": "https://i.ibb.co/wYfN5wR/risk-process.png"
    },
    {
        "id": 5,
        "domain": "Improvement",
        "title": "PDCA Cycle for Improvement",
        "summary": "The Plan-Do-Check-Act cycle is the engine for continual improvement in an AMS.",
        "highlights": [
            "Plan: Identify an opportunity and plan a change.",
            "Do: Implement the change on a small scale.",
            "Check: Measure the results and see if it worked.",
            "Act: If successful, standardize the improvement. If not, learn and try again."
        ],
        "image": "https://i.ibb.co/F8C06jP/pdca-cycle-simple.png"
    }
];

export const cheatsheetsModule: Lesson = {
    id: 'cama-cheatsheets',
    title: 'Interactive: Cheatsheets & Mind Maps',
    prompt: '',
    moduleType: 'cheatsheets',
    objectives: [
        "Quickly reference key concepts from the ISO 55001 standard.",
        "Visualize the relationships between strategic, tactical, and operational asset management.",
        "Reinforce understanding of core CAMA domain knowledge."
    ],
    cheatsheets: cheatsheets,
};
