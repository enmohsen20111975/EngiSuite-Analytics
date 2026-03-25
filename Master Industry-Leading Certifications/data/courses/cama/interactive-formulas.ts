import type { Lesson, Formula } from '../../types';

const formulas: Formula[] = [
    {
      "id": 1,
      "domain": "Financial Decision Making",
      "title": "Life Cycle Costing (LCC)",
      "formula": "LCC = CAPEX + PV(OPEX) + PV(Maint) + PV(Disposal)",
      "description": "LCC evaluates the total cost of ownership of an asset, from acquisition to disposal, discounting future costs to their present value.",
      "example": "Asset A has low CAPEX but high OPEX. Asset B has high CAPEX but low OPEX. LCC helps determine which is cheaper over the asset's life.",
      "image": "https://i.ibb.co/FVRYTYk/lcc.png"
    },
    {
      "id": 2,
      "domain": "Financial Decision Making",
      "title": "Net Present Value (NPV)",
      "formula": "NPV = Σ [ Cashflow_t / (1+r)^t ] - Initial Investment",
      "description": "NPV is used to evaluate the profitability of an investment by discounting all future cash flows. A positive NPV indicates a worthwhile investment.",
      "example": "A project costs $100k and will generate $40k/yr for 3 yrs. At a 10% discount rate (r), the NPV would be positive, making it a good investment.",
      "image": "https://i.ibb.co/2qLQYdJ/npv.png"
    },
    {
      "id": 3,
      "domain": "Performance Management",
      "title": "Return on Investment (ROI)",
      "formula": "ROI = [(Net Profit - Investment) / Investment] × 100%",
      "description": "ROI measures the financial gain or loss of an investment relative to its cost. It is a simple way to assess profitability.",
      "example": "An investment of $50k leads to a net profit of $70k. ROI = [($70k - $50k) / $50k] * 100% = 40%.",
      "image": "https://i.ibb.co/JqK7g7x/roi-formula.png"
    },
    {
      "id": 4,
      "domain": "Performance Management",
      "title": "Availability",
      "formula": "A = MTBF / (MTBF + MTTR)",
      "description": "A fundamental measure of asset performance, representing the percentage of time an asset is operational and ready to perform its function.",
      "example": "An asset runs for 950 hours (MTBF) and takes 50 hours to repair (MTTR). Availability = 950 / (950 + 50) = 95%.",
      "image": "https://i.ibb.co/5h3Lkpf/availability.png"
    }
];

export const formulasModule: Lesson = {
    id: 'cama-9',
    title: 'Interactive: Formula Library',
    prompt: '',
    moduleType: 'formulas',
    objectives: ["Understand key financial formulas for asset investment decisions.", "Review performance metrics for asset management.", "Apply formulas for LCC, NPV, ROI, and Availability."],
    formulas: formulas,
};