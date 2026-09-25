import type { Lesson, CaseStudy } from '../../types';

const caseStudies: CaseStudy[] = [
    {
      "id": 1,
      "domain": "Business & Management",
      "industry": "Automotive",
      "title": "Toyota – TPM Implementation",
      "summary": "Toyota integrated Total Productive Maintenance with Lean principles.",
      "details": [
        "TPM improved OEE from ~70% to >90% in pilot lines.",
        "Cross-functional teams owned equipment reliability.",
        "Strong link between maintenance and business KPIs."
      ],
      "image": "https://i.ibb.co/Z6dprgK/toyota-tpm.png"
    },
    {
      "id": 2,
      "domain": "Business & Management",
      "industry": "Oil & Gas",
      "title": "ExxonMobil – LCC Optimization",
      "summary": "Life Cycle Costing used for pipeline equipment decisions.",
      "details": [
        "NPV and LCC modeling saved $25M over 15 years.",
        "Risk-adjusted economics justified predictive maintenance investments.",
        "Balanced replacement vs repair decisions."
      ],
      "image": "https://i.ibb.co/QHpRr3M/exxon-lcc.png"
    },
    {
      "id": 3,
      "domain": "Manufacturing Process Reliability",
      "industry": "Pharmaceutical",
      "title": "Pfizer – RCM in Critical Utilities",
      "summary": "Reliability-Centered Maintenance applied to clean utilities and HVAC.",
      "details": [
        "RCM identified hidden failures in backup systems.",
        "PM intervals optimized, downtime reduced by 20%.",
        "Improved regulatory compliance and product quality."
      ],
      "image": "https://i.ibb.co/hWHh7dx/pfizer-rcm.png"
    },
    {
      "id": 4,
      "domain": "Equipment Reliability",
      "industry": "Mining",
      "title": "Rio Tinto – Reliability Growth",
      "summary": "Weibull analysis and PdM applied to haul trucks.",
      "details": [
        "MTBF improved by 35% over 2 years.",
        "PdM reduced catastrophic failures by early detection.",
        "Savings > $10M from reduced downtime."
      ],
      "image": "https://i.ibb.co/7Y5Rp5X/rio-reliability.png"
    },
    {
      "id": 5,
      "domain": "Equipment Reliability",
      "industry": "Power Generation",
      "title": "GE – Gas Turbine Condition Monitoring",
      "summary": "IoT-based monitoring for turbine blade health.",
      "details": [
        "Real-time vibration analysis detected early cracks.",
        "Avoided unplanned outage worth $3M.",
        "Enabled predictive scheduling of inspections."
      ],
      "image": "https://i.ibb.co/7zp6NSq/ge-turbine.png"
    },
    {
      "id": 6,
      "domain": "Organization & Leadership",
      "industry": "Utilities",
      "title": "Duke Energy – Safety Culture Shift",
      "summary": "Leadership-driven cultural change in maintenance teams.",
      "details": [
        "Lost-time incidents reduced by 50% in 3 years.",
        "Leaders trained in transformational and servant leadership.",
        "Safety and reliability KPIs improved in parallel."
      ],
      "image": "https://i.ibb.co/tM1NnCc/duke-safety.png"
    },
    {
      "id": 7,
      "domain": "Organization & Leadership",
      "industry": "Food & Beverage",
      "title": "Nestlé – Workforce Competency",
      "summary": "Skills matrix used to track and develop technician capabilities.",
      "details": [
        "Multi-skilling increased technician flexibility.",
        "Schedule compliance improved by 15%.",
        "Employee satisfaction scores improved."
      ],
      "image": "https://i.ibb.co/rsQcV82/nestle-competency.png"
    },
    {
      "id": 8,
      "domain": "Work Management",
      "industry": "Pharmaceutical",
      "title": "Novartis – Weekly Scheduling Discipline",
      "summary": "Introduction of frozen weekly schedules to stabilize workflow.",
      "details": [
        "Backlog reduced by 30% in one year.",
        "Planner-to-technician ratio optimized.",
        "PM compliance improved significantly."
      ],
      "image": "https://i.ibb.co/jLDZnZz/novartis-scheduling.png"
    },
    {
      "id": 9,
      "domain": "Work Management",
      "industry": "Refinery",
      "title": "Shell – CMMS-Driven Planning",
      "summary": "Using CMMS data to improve wrench time.",
      "details": [
        "Wrench time improved from 35% to 55%.",
        "CMMS data accuracy reached >90%.",
        "Resulted in cost savings and higher asset uptime."
      ],
      "image": "https://i.ibb.co/hB0hCS0/shell-cmms.png"
    },
    {
      "id": 10,
      "domain": "Work Management",
      "industry": "Power Plant",
      "title": "Siemens – Work Feedback Loop",
      "summary": "Closed-loop feedback integrated into CMMS.",
      "details": [
        "Technicians reported actuals (hours, parts, causes).",
        "PM effectiveness improved by 20%.",
        "Enabled predictive work scheduling."
      ],
      "image": "https://i.ibb.co/QpjwC0T/siemens-feedback.png"
    }
];

export const caseStudiesModule: Lesson = {
    id: 'cmrp-6',
    title: 'Interactive: Case Studies',
    prompt: '',
    moduleType: 'caseStudies',
    objectives: ["Analyze real-world applications of reliability principles across various industries.", "Identify key actions and outcomes from successful maintenance and reliability initiatives.", "Connect theoretical concepts to practical, industry-specific challenges."],
    cases: caseStudies,
};