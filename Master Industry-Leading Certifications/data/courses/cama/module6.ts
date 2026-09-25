import type { Lesson } from '../../types';

export const module6: Lesson = {
    id: 'cama-6',
    title: 'Module 6: Performance Evaluation',
    prompt: '',
    moduleType: 'standard',
    objectives: [
        "Establish KPIs to monitor, measure, and analyze AM performance.",
        "Conduct effective internal audits of the AMS based on ISO 19011.",
        "Facilitate structured management reviews to ensure AMS effectiveness.",
        "Utilize performance data to drive strategic decisions."
    ],
    content: [
        {
            type: 'text',
            body: `<h2>Chapter 1: Monitoring, Measurement, and Analysis</h2>
            <p>ISO 55001 requires organizations to monitor and measure AM performance. This involves collecting data and translating it into Key Performance Indicators (KPIs) like MTBF, MTTR, Availability, and OEE. Analysis of these metrics identifies trends, gaps, and improvement opportunities.</p>
            <h3>Case Study: Global Mining Company</h3>
            <p>Facing frequent breakdowns, a mining company implemented fleet-wide IoT sensors. By tracking MTBF, MTTR, and OEE on dashboards, their reliability team improved equipment availability by 12% and reduced downtime costs by $45M annually.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 2: Internal Audit of the AMS</h2>
            <p>Internal audits provide independent assurance that the AMS conforms to ISO 55001 and delivers intended outcomes. Guided by <strong>ISO 19011</strong>, audits should focus not only on compliance but also on value delivery and maturity progression.</p>`
        },
        {
            type: 'text',
            body: `<h2>Chapter 3: Management Review</h2>
            <p>Management reviews are mandated by ISO 55001 to ensure leadership remains engaged and the AMS continues to be suitable, adequate, and effective. Inputs include audit results, KPIs, and stakeholder feedback. Outputs are strategic decisions, such as reallocating resources or updating policies.</p>`
        },
        {
            type: 'quiz',
            question: "Which ISO guideline provides principles for auditing management systems, including an AMS?",
            options: ["ISO 55000", "ISO 9001", "ISO 19011", "ISO 45001"],
            correctAnswerIndex: 2,
            explanation: "ISO 19011 provides comprehensive guidance on the principles of auditing, managing an audit program, conducting audits, and the competence of auditors for any type of management system."
        },
        {
            type: 'quiz',
            question: "Which KPI is defined as MTBF / (MTBF + MTTR)?",
            options: ["OEE", "Availability", "Reliability", "Utilization"],
            correctAnswerIndex: 1,
            explanation: "This formula calculates Inherent Availability, which measures the percentage of time an asset is expected to be available for use by considering only its reliability (MTBF) and maintainability (MTTR)."
        }
    ]
};
