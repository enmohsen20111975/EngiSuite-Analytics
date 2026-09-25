import type { Lesson, Formula } from '../../types';

const formulas: Formula[] = [
    {
      "id": 1,
      "domain": "Business & Management",
      "title": "Availability",
      "formula": "A = MTBF / (MTBF + MTTR)",
      "description": "Availability combines reliability (MTBF) and maintainability (MTTR).",
      "example": "If MTBF=100 hrs, MTTR=10 hrs → A = 100/(100+10)=0.91 → 91%.",
      "image": "https://i.ibb.co/5h3Lkpf/availability.png"
    },
    {
      "id": 2,
      "domain": "Business & Management",
      "title": "Overall Equipment Effectiveness (OEE)",
      "formula": "OEE = Availability × Performance × Quality",
      "description": "OEE measures effective utilization of equipment.",
      "example": "If A=0.9, P=0.95, Q=0.98 → OEE=0.9×0.95×0.98=0.836 → 83.6%.",
      "image": "https://i.ibb.co/8bft1jQ/oee.png"
    },
    {
      "id": 3,
      "domain": "Business & Management",
      "title": "Mean Time Between Failures (MTBF)",
      "formula": "MTBF = Total Operating Time ÷ Number of Failures",
      "description": "MTBF is the average time between consecutive failures.",
      "example": "1000 hrs of operation / 5 failures = 200 hrs MTBF.",
      "image": "https://i.ibb.co/qDp4Rdc/mtbf.png"
    },
    {
      "id": 4,
      "domain": "Business & Management",
      "title": "Mean Time To Repair (MTTR)",
      "formula": "MTTR = Total Repair Time ÷ Number of Failures",
      "description": "MTTR is the average time to restore equipment to service.",
      "example": "50 hrs total repair / 10 failures = 5 hrs MTTR.",
      "image": "https://i.ibb.co/VHsNLMz/mttr.png"
    },
    {
      "id": 5,
      "domain": "Business & Management",
      "title": "Life Cycle Costing (LCC)",
      "formula": "LCC = C_acq + Σ[(C_op(t)+C_m(t))/(1+r)^t] + C_disp/(1+r)^n",
      "description": "LCC estimates the total cost of ownership of an asset.",
      "example": "Acquisition=$100k, O&M=$20k/yr for 5 yrs at 10% discount → LCC≈$176k.",
      "image": "https://i.ibb.co/FVRYTYk/lcc.png"
    },
    {
      "id": 6,
      "domain": "Business & Management",
      "title": "Net Present Value (NPV)",
      "formula": "NPV = Σ [ Cashflow_t / (1+r)^t ]",
      "description": "NPV discounts future cash flows to present value.",
      "example": "CF=$50k/yr for 3 yrs, r=10% → NPV≈$124k.",
      "image": "https://i.ibb.co/2qLQYdJ/npv.png"
    },
    {
      "id": 7,
      "domain": "Business & Management",
      "title": "Payback Period",
      "formula": "Payback = Investment ÷ Annual Savings",
      "description": "Payback shows time required to recover investment.",
      "example": "Investment=$100k, Savings=$25k/yr → Payback=4 yrs.",
      "image": "https://i.ibb.co/ZH9q8qc/payback.png"
    },
    {
      "id": 8,
      "domain": "Manufacturing Process Reliability",
      "title": "Risk Priority Number (RPN)",
      "formula": "RPN = Severity × Occurrence × Detectability",
      "description": "Used in FMEA to prioritize risks.",
      "example": "S=7, O=5, D=4 → RPN=140.",
      "image": "https://i.ibb.co/Z6Vt6d6/rpn.png"
    },
    {
      "id": 9,
      "domain": "Equipment Reliability",
      "title": "Failure Rate",
      "formula": "λ = 1 ÷ MTBF",
      "description": "Failure rate is inverse of MTBF for exponential distributions.",
      "example": "MTBF=200 hrs → λ=0.005 failures/hr.",
      "image": "https://i.ibb.co/BfbZ88y/failure-rate.png"
    },
    {
      "id": 10,
      "domain": "Work Management",
      "title": "Schedule Compliance",
      "formula": "Schedule Compliance = (Completed Planned Jobs ÷ Total Planned Jobs) × 100%",
      "description": "Measures execution discipline vs planned schedule.",
      "example": "90 planned jobs, 80 completed → SC=89%.",
      "image": "https://i.ibb.co/G0V1gX3/schedule-compliance.png"
    },
    {
      "id": 11,
      "domain": "Work Management",
      "title": "Planned Work Ratio",
      "formula": "Planned Work Ratio = Planned Work Hours ÷ Total Work Hours × 100%",
      "description": "Shows maturity of proactive work management.",
      "example": "600 planned hrs / 800 total hrs → 75%.",
      "image": "https://i.ibb.co/FwRgjWS/planned-work.png"
    },
    {
      "id": 12,
      "domain": "Work Management",
      "title": "PM Compliance",
      "formula": "PM Compliance = (Completed PMs ÷ Scheduled PMs) × 100%",
      "description": "Tracks timely execution of preventive maintenance tasks.",
      "example": "50 PMs scheduled, 47 completed → 94%.",
      "image": "https://i.ibb.co/3pGBdRd/pm-compliance.png"
    }
];

export const formulasModule: Lesson = {
    id: 'cmrp-10',
    title: 'Interactive: Formula Library',
    prompt: '',
    moduleType: 'formulas',
    objectives: ["Understand the application and calculation of critical reliability and management formulas.", "Review practical examples for each formula.", "Visualize the components and relationships in key equations."],
    formulas: formulas,
};