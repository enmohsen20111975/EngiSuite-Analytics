import type { Lesson, Cheatsheet } from '../../types';

const cheatsheets: Cheatsheet[] = [
    {
        "id": 1,
        "domain": "Core Concepts",
        "title": "DMAIC Project Framework",
        "summary": "The five-phase structured methodology for data-driven process improvement.",
        "highlights": [
            "Define: Charter the project, define the problem and goal.",
            "Measure: Collect baseline data to quantify the problem.",
            "Analyze: Identify the root cause(s) of the problem.",
            "Improve: Develop, test, and implement solutions.",
            "Control: Sustain the gains and monitor the new process."
        ],
        "image": "https://i.ibb.co/F8C06jP/pdca-cycle-simple.png"
    },
    {
        "id": 2,
        "domain": "Core Concepts",
        "title": "The 8 Wastes (DOWNTIME)",
        "summary": "The eight types of non-value-added activities that Lean seeks to eliminate.",
        "highlights": [
            "Defects: Rework, scrap, incorrect information.",
            "Overproduction: Producing more or sooner than needed.",
            "Waiting: Idle time for people or machines.",
            "Non-Utilized Talent: Not using people's full capabilities.",
            "Transportation: Unnecessary movement of products/materials.",
            "Inventory: Excess products and materials.",
            "Motion: Unnecessary movement by people.",
            "Extra-Processing: Doing more work than required."
        ],
        "image": "https://i.ibb.co/MfZ0g3c/8-wastes.png"
    },
    {
        "id": 3,
        "domain": "Measure/Analyze",
        "title": "Cp vs. Cpk",
        "summary": "Understanding the two key measures of process capability.",
        "highlights": [
            "Cp (Potential): Measures if the process is NARROW enough to fit in the specs. Ignores centering.",
            "Cpk (Performance): Measures if the process is CENTERED and narrow enough. Cpk is always ≤ Cp.",
            "If Cp is high but Cpk is low, the process is off-center.",
            "Goal: Cpk ≥ 1.33"
        ],
        "image": "https://i.ibb.co/tZ5hJqf/cpk-diagram.png"
    },
    {
        "id": 4,
        "domain": "Analyze",
        "title": "Pareto Principle (80/20 Rule)",
        "summary": "A fundamental principle for prioritization in problem-solving.",
        "highlights": [
            "States that for many events, roughly 80% of the effects come from 20% of the causes.",
            "A Pareto Chart is used to visualize this and identify the 'vital few' causes.",
            "Focusing on the vital few allows for the greatest impact with limited resources."
        ],
        "image": "https://i.ibb.co/JqK7g7x/roi-formula.png"
    },
    {
        "id": 5,
        "domain": "Improve",
        "title": "5S for Workplace Organization",
        "summary": "A Lean tool for creating and maintaining an organized, efficient, and safe workplace.",
        "highlights": [
            "Sort: Remove unnecessary items.",
            "Set in Order: A place for everything, and everything in its place.",
            "Shine: Clean the workspace.",
            "Standardize: Create rules to maintain the first 3 S's.",
            "Sustain: Make it a habit and audit the process."
        ],
        "image": "https://i.ibb.co/wYfN5wR/risk-process.png"
    }
];

export const cheatsheetsModule: Lesson = {
    id: 'lss-cheatsheets',
    title: 'Interactive: Cheatsheets & Mind Maps',
    prompt: '',
    moduleType: 'cheatsheets',
    objectives: [
        "Quickly reference key Lean Six Sigma concepts like DMAIC and the 8 Wastes.",
        "Visualize the difference between key metrics like Cp and Cpk.",
        "Reinforce understanding of core Green Belt tools and principles."
    ],
    cheatsheets: cheatsheets,
};
