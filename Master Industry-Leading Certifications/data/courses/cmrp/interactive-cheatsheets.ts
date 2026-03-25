import type { Lesson, Cheatsheet } from '../../types';

const cheatsheets: Cheatsheet[] = [
    {
      "id": 1,
      "domain": "Business & Management",
      "title": "KPI Overview",
      "summary": "Key metrics used to measure reliability and performance.",
      "highlights": [
        "MTBF ↑ = More reliable",
        "MTTR ↓ = Faster recovery",
        "Availability = MTBF/(MTBF+MTTR)",
        "OEE = A × P × Q (world-class ≥ 85%)"
      ],
      "image": "https://i.ibb.co/8bft1jQ/oee.png"
    },
    {
      "id": 2,
      "domain": "Business & Management",
      "title": "Life Cycle Costing",
      "summary": "Breakdown of total cost of ownership.",
      "highlights": [
        "Acquisition ~20%",
        "O&M ~80%",
        "Include disposal costs",
        "Discount future cash flows"
      ],
      "image": "https://i.ibb.co/FVRYTYk/lcc.png"
    },
    {
      "id": 3,
      "domain": "Manufacturing Process Reliability",
      "title": "RCM Process Map",
      "summary": "Reliability-Centered Maintenance workflow.",
      "highlights": [
        "Define functions",
        "Identify failure modes",
        "Analyze effects",
        "Select tasks (PM/PdM/Run-to-failure)"
      ],
      "image": "https://i.ibb.co/hWHh7dx/pfizer-rcm.png"
    },
    {
      "id": 4,
      "domain": "Manufacturing Process Reliability",
      "title": "FMEA Essentials",
      "summary": "Risk Priority Number method.",
      "highlights": [
        "RPN = S × O × D",
        "Rank failure modes by risk",
        "Focus on high RPN first"
      ],
      "image": "https://i.ibb.co/Z6Vt6d6/rpn.png"
    },
    {
      "id": 5,
      "domain": "Equipment Reliability",
      "title": "Bathtub Curve",
      "summary": "Phases of equipment failure.",
      "highlights": [
        "Infant mortality (early failures)",
        "Random failures (useful life)",
        "Wear-out failures (end of life)"
      ],
      "image": "https://i.ibb.co/7Y5Rp5X/rio-reliability.png"
    },
    {
      "id": 6,
      "domain": "Equipment Reliability",
      "title": "Weibull Analysis",
      "summary": "Statistical tool for reliability modeling.",
      "highlights": [
        "β<1 → Infant mortality",
        "β=1 → Random failures",
        "β>1 → Wear-out failures"
      ],
      "image": "https://i.ibb.co/BfbZ88y/failure-rate.png"
    },
    {
      "id": 7,
      "domain": "Organization & Leadership",
      "title": "Leadership Styles",
      "summary": "Overview of leadership approaches in maintenance.",
      "highlights": [
        "Transformational: Vision & inspiration",
        "Transactional: Rewards & penalties",
        "Servant: Empowering team growth"
      ],
      "image": "https://i.ibb.co/XF8T6fD/leadership-styles.png"
    },
    {
      "id": 8,
      "domain": "Organization & Leadership",
      "title": "Change Management (Kotter’s 8 Steps)",
      "summary": "Structured model for leading change.",
      "highlights": [
        "Create urgency",
        "Form coalition",
        "Develop vision",
        "Communicate, Empower, Generate Wins, Sustain, Anchor"
      ],
      "image": "https://i.ibb.co/qj5b81D/kotter-change-model.png"
    },
    {
      "id": 9,
      "domain": "Work Management",
      "title": "Work Management Cycle",
      "summary": "Steps of effective maintenance work management.",
      "highlights": [
        "Identification → Planning → Scheduling → Execution → Feedback",
        "Closed-loop ensures continuous improvement"
      ],
      "image": "https://i.ibb.co/PNScz3V/work-management-cycle.png"
    },
    {
      "id": 10,
      "domain": "Work Management",
      "title": "Key Work Management KPIs",
      "summary": "Measures of efficiency in work execution.",
      "highlights": [
        "Wrench Time (target 50–60%)",
        "Schedule Compliance (>90%)",
        "PM Compliance (>95%)",
        "Backlog (3–4 weeks healthy)"
      ],
      "image": "https://i.ibb.co/G0V1gX3/schedule-compliance.png"
    }
];

export const cheatsheetsModule: Lesson = {
    id: 'cmrp-7',
    title: 'Interactive: Cheatsheets & Mind Maps',
    prompt: '',
    moduleType: 'cheatsheets',
    objectives: ["Quickly reference key formulas, concepts, and frameworks.", "Visualize complex processes and relationships.", "Reinforce understanding of core CMRP domain knowledge."],
    cheatsheets: cheatsheets,
};