import type { Lesson } from '../../types';

export const module3: Lesson = {
    id: 'cama-3',
    title: 'Module 3: Planning',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Develop a Strategic Asset Management Plan (SAMP) that links corporate goals to AM actions.",
        "Apply risk-based planning techniques like FMEA and bow-tie analysis.",
        "Incorporate demand forecasting and capacity planning into AM strategies.",
        "Utilize financial tools like Life Cycle Costing (LCC) and Net Present Value (NPV) for decision-making."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Strategic Asset Management Planning (SAMP)</h2>
            <p>The SAMP is the bridge between corporate strategy and operational AM plans. It's a documented plan that specifies how organizational objectives are converted into AM objectives, strategies, and long-term actions. A strong SAMP balances cost, risk, and performance over the asset lifecycle.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Risk-Based Planning</h2>
            <p>Risk-based planning ensures resources are allocated where they deliver the highest value. It requires identifying asset risks, assessing their likelihood and consequences (using tools like risk matrices), and applying mitigation strategies. This approach is fundamental to ISO 55000.</p>
            <h3>Case Study: TransCanada Pipelines</h3>
            <p>To manage high-consequence failures in aging pipelines, TransCanada developed a comprehensive risk register and applied bow-tie analysis. This allowed them to integrate risk results directly into capital planning, reducing incidents and optimizing budgets.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Demand Forecasting and Capacity Planning</h2>
            <p>Asset managers must anticipate future demand to plan capacity and investments. This involves analyzing trends (e.g., demographic, economic) to prevent overinvestment (excess capacity) or underinvestment (service failures). For example, an electricity utility must forecast demand growth from electric vehicles and plan grid upgrades accordingly.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 4: Financial and Lifecycle Planning</h2>
            <p>Financial planning is critical for sustaining asset performance. This involves integrating acquisition, operation, maintenance, and disposal costs into models like <strong>Life Cycle Costing (LCC)</strong> and <strong>Net Present Value (NPV)</strong> to make the most economical long-term decisions.</p>`
        },
        {
            type: 'quiz',
            question: "Which risk tool visualizes preventive and mitigative controls around a central event?",
            options: ["Bow-Tie Analysis", "Regression Model", "NPV", "Stakeholder Map"],
            correctAnswerIndex: 0,
            explanation: "The bow-tie analysis is a powerful visual tool. It shows the 'knot' as the risk event, with threats and preventive controls on the left side (like the bow-tie's knot) and consequences with mitigating controls on the right."
        },
        {
            type: 'quiz',
            question: "What is the primary purpose of a Strategic Asset Management Plan (SAMP)?",
            options: [
                "To list daily maintenance tasks",
                "To link organizational objectives to AM objectives and strategies",
                "To define spare parts inventory",
                "To replace regulatory reporting"
            ],
            correctAnswerIndex: 1,
            explanation: "The SAMP is the critical document that translates high-level corporate goals (e.g., 'reduce carbon footprint') into tangible asset management objectives (e.g., 'replace 20% of fossil-fuel fleet with EVs by 2030') and the strategies to achieve them."
        }
    ]
};
