import type { Lesson, Cheatsheet } from '../../types';

const cheatsheets: Cheatsheet[] = [
    {
        "id": 1,
        "domain": "Process",
        "title": "Earned Value Management (EVM) Formulas",
        "summary": "Core formulas for measuring project performance and forecasting outcomes.",
        "highlights": [
            "CV = EV - AC (Cost Variance)",
            "SV = EV - PV (Schedule Variance)",
            "CPI = EV / AC (Cost Performance Index > 1 is good)",
            "SPI = EV / PV (Schedule Performance Index > 1 is good)",
            "EAC = BAC / CPI (Estimate at Completion)"
        ],
        "image": "https://i.ibb.co/6P2X7f4/evm-graph.png"
    },
    {
        "id": 2,
        "domain": "People",
        "title": "Tuckman Ladder of Team Development",
        "summary": "The five stages of team formation that leaders must navigate.",
        "highlights": [
            "Forming: Team is polite, uncertain. Leader provides direction.",
            "Storming: Conflict arises. Leader coaches.",
            "Norming: Team builds cohesion. Leader facilitates.",
            "Performing: Team is self-managing. Leader delegates.",
            "Adjourning: Team disbands."
        ],
        "image": "https://i.ibb.co/XF8T6fD/leadership-styles.png"
    },
    {
        "id": 3,
        "domain": "People",
        "title": "Conflict Resolution Techniques",
        "summary": "The five primary strategies for managing conflict within a project team.",
        "highlights": [
            "Collaborate/Problem-Solve (Win-Win): Preferred method.",
            "Compromise/Reconcile (Lose-Lose): Find a middle ground.",
            "Smooth/Accommodate (Yield-Lose): Prioritize relationship.",
            "Force/Direct (Win-Lose): Use in emergencies.",
            "Withdraw/Avoid: For trivial issues."
        ],
        "image": "https://i.ibb.co/qj5b81D/kotter-change-model.png"
    },
    {
        "id": 4,
        "domain": "Process (Risk)",
        "title": "Risk Response Strategies",
        "summary": "How to respond to negative risks (threats) and positive risks (opportunities).",
        "highlights": [
            "Threats: Avoid, Mitigate, Transfer, Accept.",
            "Opportunities: Exploit, Enhance, Share, Accept."
        ],
        "image": "https://i.ibb.co/wYfN5wR/risk-process.png"
    },
    {
        "id": 5,
        "domain": "Process",
        "title": "Predictive vs. Adaptive Life Cycles",
        "summary": "Choosing the right project approach based on requirements and uncertainty.",
        "highlights": [
            "Predictive (Waterfall): Requirements are fixed. Plan-driven. Change is costly.",
            "Adaptive (Agile): Requirements are dynamic. Value-driven. Change is expected."
        ],
        "image": "https://i.ibb.co/s5JdvyN/spotify-agile.png"
    }
];

export const cheatsheetsModule: Lesson = {
    id: 'pmp-cheatsheets',
    title: 'Interactive: Cheatsheets & Mind Maps',
    prompt: '',
    moduleType: 'cheatsheets',
    objectives: [
        "Quickly reference critical PMP formulas for EVM and estimation.",
        "Visualize key concepts in leadership, team development, and risk management.",
        "Reinforce understanding of the core PMP exam content."
    ],
    cheatsheets: cheatsheets,
};
