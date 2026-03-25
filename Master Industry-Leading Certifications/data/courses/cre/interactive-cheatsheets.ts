import type { Lesson, Cheatsheet } from '../../types';

const cheatsheets: Cheatsheet[] = [
    {
        "id": 1,
        "domain": "Fundamentals",
        "title": "Core RAM Metrics",
        "summary": "The essential metrics for quantifying reliability, availability, and maintainability.",
        "highlights": [
            "MTBF (Mean Time Between Failures): For repairable items. Higher is better.",
            "MTTF (Mean Time To Failure): For non-repairable items.",
            "MTTR (Mean Time To Repair): Measures maintainability. Lower is better.",
            "Availability = MTBF / (MTBF + MTTR). The percentage of uptime."
        ],
        "image": "https://i.ibb.co/5h3Lkpf/availability.png"
    },
    {
        "id": 2,
        "domain": "Modeling",
        "title": "The Bathtub Curve",
        "summary": "Visualizing the three phases of a product's life based on its failure rate.",
        "highlights": [
            "Infant Mortality: Decreasing failure rate (early life). Caused by manufacturing defects.",
            "Useful Life: Constant failure rate (random failures).",
            "Wear-Out: Increasing failure rate (end of life). Caused by aging and fatigue."
        ],
        "image": "https://i.ibb.co/sKk60hB/weibull-curve.png"
    },
    {
        "id": 3,
        "domain": "Modeling",
        "title": "Weibull Beta (β) Interpretation",
        "summary": "Understanding what the Weibull shape parameter (Beta) tells you about failure mode.",
        "highlights": [
            "β < 1: Infant Mortality (decreasing failure rate).",
            "β ≈ 1: Random Failures (constant failure rate). Time-based PM is ineffective.",
            "β > 1: Wear-Out Failures (increasing failure rate). Time-based PM may be effective."
        ],
        "image": "https://i.ibb.co/BfbZ88y/failure-rate.png"
    },
    {
        "id": 4,
        "domain": "Modeling",
        "title": "Reliability Block Diagram (RBD) Formulas",
        "summary": "Calculating system reliability for basic series and parallel configurations.",
        "highlights": [
            "Series: R_sys = R1 * R2 * ... * Rn (System is weaker than the weakest link).",
            "Parallel: R_sys = 1 - [(1-R1) * (1-R2)] (System is stronger than the strongest link)."
        ],
        "image": "https://i.ibb.co/q0Vv2hX/parallel-rbd.png"
    },
    {
        "id": 5,
        "domain": "Failure Analysis",
        "title": "FMEA vs. FTA",
        "summary": "Differentiating between the two primary methods of failure analysis.",
        "highlights": [
            "FMEA (Inductive / Bottom-Up): Asks 'What if this part fails?'. Used proactively in design.",
            "FTA (Deductive / Top-Down): Asks 'How could this system failure have occurred?'. Used for investigation."
        ],
        "image": "https://i.ibb.co/Yd43zG8/fmea-vs-fta.png"
    }
];

export const cheatsheetsModule: Lesson = {
    id: 'cre-cheatsheets',
    title: 'Interactive: Cheatsheets & Mind Maps',
    prompt: '',
    moduleType: 'cheatsheets',
    objectives: [
        "Quickly reference key reliability formulas and concepts.",
        "Visualize the different phases of equipment life and failure modes.",
        "Reinforce understanding of core CRE Body of Knowledge topics."
    ],
    cheatsheets: cheatsheets,
};
