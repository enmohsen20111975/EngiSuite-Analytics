import type { Lesson } from '../../types';

export const pillar1: Lesson = { 
    id: 'cmrp-1', 
    title: 'Pillar 1: Business & Management', 
    prompt: 'Generate a detailed lesson on the "Business & Management" pillar for the CMRP certification. Cover key topics like creating a strategic direction, administering the maintenance business, managing stakeholders, and measuring performance with KPIs like OEE, MTBF, and PM Compliance. Structure the content for beginner, intermediate, and advanced levels. Include learning objectives, multiple examples, detailed quiz questions, and relevant visuals like the OeeEquation and LccComparisonChart.',
    moduleType: 'standard',
    objectives: [
        "Align maintenance and reliability goals with the organization's strategic business objectives.",
        "Identify and manage key stakeholders to ensure support for reliability initiatives.",
        "Measure and track performance using key performance indicators (KPIs) like OEE, MTBF, and PM Compliance.",
        "Apply financial principles like Life Cycle Costing (LCC) to justify maintenance decisions."
    ],
    content: [
        {
            type: 'text',
            body: "<h3>The Foundation (Beginner)</h3><p>At its core, the Business & Management pillar is about ensuring that maintenance and reliability activities provide tangible value to the organization. Maintenance is not just about fixing things; it's a critical business function that impacts profitability, safety, and customer satisfaction. The first step is to create a <strong>strategic direction</strong> that directly links reliability efforts to the company's overall goals. For example, if a company's goal is to be the lowest-cost producer, the maintenance strategy should focus on maximizing uptime and minimizing production losses.</p>"
        },
        {
            type: 'text',
            body: "<h3>Application & Process (Intermediate)</h3><h4>Measuring Performance with KPIs</h4><p>You can't manage what you don't measure. Key Performance Indicators (KPIs) are essential for tracking progress and identifying areas for improvement. Some of the most critical KPIs in this pillar include:</p><ul><li><strong>Overall Equipment Effectiveness (OEE):</strong> A comprehensive metric that measures the percentage of planned production time that is truly productive.</li><li><strong>Mean Time Between Failures (MTBF):</strong> A measure of reliability, indicating the average time equipment operates between failures.</li><li><strong>Preventive Maintenance (PM) Compliance:</strong> The percentage of scheduled PM tasks completed on time, indicating the discipline of the work management process.</li></ul>"
        },
        {
            type: 'visual',
            component: 'OeeEquation'
        },
        {
            type: 'text',
            body: "<h4>Administering the Maintenance Business</h4><p>This involves managing budgets, personnel, and suppliers. It requires effective communication with all stakeholders—from operators on the plant floor to senior executives in the boardroom. A key part of this is being able to justify maintenance expenditures in financial terms that business leaders can understand.</p>"
        },
        {
            type: 'text',
            body: "<h3>Strategy & Analysis (Advanced)</h3><h4>Life Cycle Costing (LCC)</h4><p>Making the best long-term decision for an asset requires looking beyond the initial purchase price. <strong>Life Cycle Costing (LCC)</strong> is a methodology that considers all costs associated with an asset over its entire life, including acquisition, operation, maintenance, and disposal. LCC allows you to make data-driven decisions when comparing different equipment options, repair-vs-replace scenarios, or justifying reliability improvement projects.</p>"
        },
        {
            type: 'visual',
            component: 'LccComparisonChart'
        },
        {
            type: 'quiz',
            question: "A company's primary business goal is to increase market share by guaranteeing on-time delivery. Which maintenance KPI is most directly aligned with this strategic goal?",
            options: [
                "Maintenance cost per unit",
                "PM Compliance",
                "Asset Availability",
                "Safety incident rate"
            ],
            correctAnswerIndex: 2,
            explanation: "High Asset Availability means equipment is ready to run when needed, which is essential for meeting production schedules and ensuring on-time delivery to customers. While other KPIs are important, availability has the most direct link to this specific business goal."
        },
        {
            type: 'quiz',
            question: "When evaluating two pumps with different purchase prices and energy consumption ratings, which tool is most appropriate for making the best long-term financial decision?",
            options: [
                "Root Cause Analysis (RCA)",
                "Failure Modes and Effects Analysis (FMEA)",
                "Overall Equipment Effectiveness (OEE)",
                "Life Cycle Costing (LCC)"
            ],
            correctAnswerIndex: 3,
            explanation: "Life Cycle Costing (LCC) is the correct tool because it considers not only the initial purchase price (CAPEX) but also the ongoing operational costs (OPEX) like energy consumption and maintenance, providing a total cost of ownership to compare the two options financially."
        }
    ]
};
