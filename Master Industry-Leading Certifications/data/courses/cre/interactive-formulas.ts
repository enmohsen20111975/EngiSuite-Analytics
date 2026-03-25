import type { Lesson, Formula } from '../../types';

const formulas: Formula[] = [
    {
      "id": 1,
      "domain": "Core Metrics",
      "title": "Availability (Inherent)",
      "formula": "A = MTBF / (MTBF + MTTR)",
      "description": "Calculates the 'as-designed' availability of a repairable system, considering only uptime and active repair time.",
      "example": "A system has an MTBF of 1000 hrs and an MTTR of 20 hrs. Availability = 1000 / (1000 + 20) = 98.04%.",
      "image": "https://i.ibb.co/5h3Lkpf/availability.png"
    },
    {
      "id": 2,
      "domain": "Core Metrics",
      "title": "Failure Rate (Lambda)",
      "formula": "λ = 1 / MTBF",
      "description": "Represents the rate at which failures occur in a population, assuming a constant failure rate (exponential distribution).",
      "example": "If the MTBF is 500 hours, the failure rate λ = 1/500 = 0.002 failures per hour.",
      "image": "https://i.ibb.co/BfbZ88y/failure-rate.png"
    },
    {
      "id": 3,
      "domain": "System Modeling",
      "title": "Series System Reliability",
      "formula": "R_sys = R1 × R2 × ... × Rn",
      "description": "The reliability of a series system is the product of its component reliabilities. The system fails if any single component fails.",
      "example": "Two components in series with R1=0.9 and R2=0.95. System reliability = 0.9 * 0.95 = 0.855 (85.5%).",
      "image": "https://i.ibb.co/WcKjP3g/series-rbd.png"
    },
    {
      "id": 4,
      "domain": "System Modeling",
      "title": "Parallel System Reliability",
      "formula": "R_sys = 1 - [(1 - R1) × (1 - R2)]",
      "description": "The reliability of a parallel (redundant) system. The system succeeds if at least one component succeeds.",
      "example": "Two components in parallel with R1=0.9 and R2=0.95. System reliability = 1 - [(0.1) * (0.05)] = 0.995 (99.5%).",
      "image": "https://i.ibb.co/q0Vv2hX/parallel-rbd.png"
    },
    {
      "id": 5,
      "domain": "Risk Analysis",
      "title": "Risk Priority Number (RPN)",
      "formula": "RPN = Severity × Occurrence × Detection",
      "description": "A quantitative tool from FMEA used to prioritize risks by multiplying their severity, likelihood of occurrence, and difficulty of detection.",
      "example": "A failure mode with S=8, O=3, D=5 has an RPN of 8 * 3 * 5 = 120.",
      "image": "https://i.ibb.co/Z6Vt6d6/rpn.png"
    },
    {
      "id": 6,
      "domain": "Statistical Analysis",
      "title": "Weibull Distribution Parameters",
      "formula": "β (shape), η (scale), γ (location)",
      "description": "Describes failure patterns: β < 1 (infant mortality), β ≈ 1 (random), β > 1 (wear-out). η is characteristic life. γ is failure-free time.",
      "example": "A bearing with β=2.5 indicates a strong wear-out mode, suggesting time-based replacement is a viable strategy.",
      "image": "https://i.ibb.co/sKk60hB/weibull-curve.png"
    }
];

export const formulasModule: Lesson = {
    id: 'cre-6',
    title: 'Interactive: Formula Library',
    prompt: '',
    moduleType: 'formulas',
    objectives: ["Quickly reference key reliability formulas.", "Understand the calculations for system reliability in series and parallel.", "Review core metrics like Availability, Failure Rate, and RPN."],
    formulas: formulas,
};