import type { Lesson, Formula } from '../../types';

const formulas: Formula[] = [
    {
      "id": 1,
      "domain": "Process Capability",
      "title": "Capability Potential (Cp)",
      "formula": "Cp = (USL - LSL) / 6σ",
      "description": "Measures if the process spread is narrow enough to fit within the specification limits (USL/LSL). Ignores centering.",
      "example": "A process with a 6σ spread of 12 units and specification width of 15 units has a Cp of 15/12 = 1.25.",
      "image": "https://i.ibb.co/tZ5hJqf/cpk-diagram.png"
    },
    {
      "id": 2,
      "domain": "Process Capability",
      "title": "Capability Index (Cpk)",
      "formula": "Cpk = min[ (USL-μ)/3σ, (μ-LSL)/3σ ]",
      "description": "Measures how well a process is centered within the specification limits. A Cpk < 1.0 indicates defects are being produced.",
      "example": "If a process is off-center, its Cpk will be lower than its Cp, indicating a centering problem.",
      "image": "https://i.ibb.co/tZ5hJqf/cpk-diagram.png"
    },
    {
      "id": 3,
      "domain": "Lean Metrics",
      "title": "Takt Time",
      "formula": "Takt Time = Available Time / Customer Demand",
      "description": "The 'heartbeat' of a lean process. It's the rate at which you need to complete a product to meet customer demand.",
      "example": "450 available mins / 90 units demanded = 5 minutes per unit.",
      "image": "https://i.ibb.co/qmf9g5T/takt-time.png"
    },
    {
      "id": 4,
      "domain": "Lean Metrics",
      "title": "Little's Law",
      "formula": "WIP = Throughput × Cycle Time",
      "description": "Describes the relationship between Work-In-Process (WIP), throughput (exit rate), and the time a unit spends in the system (Cycle Time).",
      "example": "If a process produces 10 units/hr and the cycle time is 2 hrs, the average WIP is 10 * 2 = 20 units.",
      "image": "https://i.ibb.co/yQZ1952/littles-law.png"
    },
    {
      "id": 5,
      "domain": "Six Sigma Metrics",
      "title": "Defects Per Million Opportunities (DPMO)",
      "formula": "DPMO = (Defects / (Units × Opps)) × 1,000,000",
      "description": "A standardized measure of process performance. A Six Sigma process has a DPMO of 3.4.",
      "example": "10 defects in 1000 units with 5 opportunities each = (10 / (1000*5)) * 1M = 2000 DPMO.",
      "image": "https://i.ibb.co/xX4bS0L/sigma-level.png"
    }
];

export const formulasModule: Lesson = {
    id: 'lss-7',
    title: 'Interactive: Formula Library',
    prompt: '',
    moduleType: 'formulas',
    objectives: ["Understand formulas for process capability (Cp, Cpk).", "Review key Lean metrics like Takt Time and Little's Law.", "Quickly reference essential Lean Six Sigma calculations."],
    formulas: formulas,
};