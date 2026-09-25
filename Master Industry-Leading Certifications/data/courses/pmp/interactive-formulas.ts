import type { Lesson, Formula } from '../../types';

const formulas: Formula[] = [
    {
      "id": 1,
      "domain": "Cost & Performance",
      "title": "Cost Performance Index (CPI)",
      "formula": "CPI = EV / AC",
      "description": "Measures the cost efficiency of budgeted resources. CPI < 1 is over budget; CPI > 1 is under budget.",
      "example": "EV = $50k, AC = $60k. CPI = 50/60 = 0.83. The project is over budget.",
      "image": "https://i.ibb.co/6P2X7f4/evm-graph.png"
    },
    {
      "id": 2,
      "domain": "Schedule & Performance",
      "title": "Schedule Performance Index (SPI)",
      "formula": "SPI = EV / PV",
      "description": "Measures schedule efficiency. SPI < 1 is behind schedule; SPI > 1 is ahead of schedule.",
      "example": "EV = $50k, PV = $55k. SPI = 50/55 = 0.91. The project is behind schedule.",
      "image": "https://i.ibb.co/6P2X7f4/evm-graph.png"
    },
    {
      "id": 3,
      "domain": "Forecasting",
      "title": "Estimate At Completion (EAC)",
      "formula": "EAC = BAC / CPI",
      "description": "A forecast of the total project cost based on performance to date. (This is the most common formula).",
      "example": "BAC = $200k, CPI = 0.8. EAC = $200k / 0.8 = $250k. The project is forecast to be $50k over budget.",
      "image": "https://i.ibb.co/6P2X7f4/evm-graph.png"
    },
    {
      "id": 4,
      "domain": "Risk Management",
      "title": "Expected Monetary Value (EMV)",
      "formula": "EMV = Probability × Impact",
      "description": "Calculates the average outcome of a future uncertain event, used to quantify risks and opportunities.",
      "example": "A risk has a 20% probability of occurring with a $50k cost impact. EMV = 0.20 * -$50k = -$10k.",
      "image": "https://i.ibb.co/N2c5Y6q/emv.png"
    },
    {
      "id": 5,
      "domain": "Schedule Estimation",
      "title": "Three-Point Estimate (PERT)",
      "formula": "E = (O + 4M + P) / 6",
      "description": "Calculates an expected duration using Optimistic (O), Most Likely (M), and Pessimistic (P) estimates.",
      "example": "O=10, M=12, P=20 days. E = (10 + 4*12 + 20) / 6 = 13 days.",
      "image": "https://i.ibb.co/GcVmPzR/pert-formula.png"
    },
    {
      "id": 6,
      "domain": "Communications",
      "title": "Communication Channels",
      "formula": "Channels = N(N-1) / 2",
      "description": "Calculates the number of communication channels in a team of N members to illustrate complexity.",
      "example": "A team of 10 people has 10 * (9) / 2 = 45 communication channels.",
      "image": "https://i.ibb.co/2Zk1hN5/comm-channels.png"
    }
];

export const formulasModule: Lesson = {
    id: 'pmp-6',
    title: 'Interactive: Formula Library',
    prompt: '',
    moduleType: 'formulas',
    objectives: ["Master key Earned Value Management (EVM) formulas.", "Understand calculations for schedule estimation and risk analysis.", "Quickly reference essential PMP formulas for exam preparation."],
    formulas: formulas,
};