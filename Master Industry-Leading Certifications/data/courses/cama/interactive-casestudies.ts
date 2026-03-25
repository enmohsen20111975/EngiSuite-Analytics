import type { Lesson, CaseStudy } from '../../types';

const caseStudies: CaseStudy[] = [
    {
        "id": 1,
        "domain": "Leadership & Planning",
        "industry": "Water Utility",
        "title": "Thames Water – ISO 55001 Certification",
        "summary": "One of the first water utilities to achieve ISO 55001 certification, transforming its approach to asset management.",
        "details": [
            "Top-down leadership commitment drove the cultural shift.",
            "Developed a clear 'line of sight' from corporate goals to daily activities.",
            "Risk-based investment planning optimized capital expenditure, saving millions.",
            "Improved regulatory compliance and customer service levels."
        ],
        "image": "https://i.ibb.co/L6V2yN6/thames-water.png"
    },
    {
        "id": 2,
        "domain": "Performance & Improvement",
        "industry": "Public Transport",
        "title": "MTR Hong Kong – Predictive Maintenance",
        "summary": "Integrated an advanced asset performance management system for its railway network.",
        "details": [
            "Used real-time data and IoT sensors to monitor asset health.",
            "Shifted from time-based to condition-based maintenance, improving availability.",
            "KPI dashboards provided clear performance visibility to management.",
            "Achieved a 99.9% on-time performance metric, a world-class standard."
        ],
        "image": "https://i.ibb.co/Yd4B3S9/mtr-hongkong.png"
    },
    {
        "id": 3,
        "domain": "Planning & Operation",
        "industry": "Power Generation",
        "title": "Hydro-Québec – Life Cycle Costing",
        "summary": "Applied rigorous Life Cycle Costing (LCC) to manage its vast portfolio of aging hydroelectric dams.",
        "details": [
            "LCC models informed decisions on dam refurbishment vs. replacement.",
            "Integrated climate change risks into long-term planning models.",
            "Optimized maintenance schedules to align with energy demand forecasts.",
            "Ensured long-term sustainable energy production for the province."
        ],
        "image": "https://i.ibb.co/Gxc794k/hydro-quebec.png"
    }
];

export const caseStudiesModule: Lesson = {
    id: 'cama-8',
    title: 'Interactive: Case Studies',
    prompt: '',
    moduleType: 'caseStudies',
    objectives: [
        "Analyze real-world applications of asset management principles.",
        "Connect ISO 55001 clauses to practical industry challenges.",
        "Evaluate the outcomes of strategic asset management initiatives."
    ],
    cases: caseStudies,
};